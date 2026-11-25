import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import raw from '../data/seed.json';
import type { DiconDataset, SimulatedDrone, Alert, Incident, PathPoint } from './types';

const seed = raw as unknown as DiconDataset;

export interface LiveDrone extends SimulatedDrone {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  signal: number;
  lastDetection: string;
  inZoneId: string | null;
}

function distMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function interpolatePath(path: PathPoint[], t: number): PathPoint {
  // t in [0, 1], path traversed forward then backward (ping-pong) for believable back-and-forth movement.
  const segs = path.length - 1;
  const totalT = t * segs;
  const seg = Math.min(Math.floor(totalT), segs - 1);
  const localT = totalT - seg;
  const p0 = path[seg];
  const p1 = path[seg + 1];
  return {
    lat: p0.lat + (p1.lat - p0.lat) * localT,
    lng: p0.lng + (p1.lng - p0.lng) * localT,
    altitude: p0.altitude + (p1.altitude - p0.altitude) * localT,
  };
}

interface SimState {
  running: boolean;
  speed: number;
  liveDrones: LiveDrone[];
  zones: DiconDataset['zones'];
  alerts: Alert[];
  incidents: Incident[];
  operators: DiconDataset['operators'];
  flights: DiconDataset['flights'];
  dataSources: DiconDataset['dataSources'];
  drones: DiconDataset['drones'];
  center: DiconDataset['center'];
  meta: DiconDataset['meta'];
  selectedDroneId: string | null;
}

interface SimActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (n: number) => void;
  selectDrone: (id: string | null) => void;
  addUnknownDrone: () => void;
  resolveIdentity: (droneId: string) => void;
  triggerRestrictedZoneEntry: () => void;
  triggerAlert: (type: string) => void;
  triggerLostTelemetry: () => void;
  createIncidentFromAlert: (alertId: string) => void;
  updateIncidentStatus: (incidentId: string, status: string) => void;
  acknowledgeAlert: (alertId: string) => void;
}

const SimContext = createContext<(SimState & SimActions) | null>(null);

function idFor(prefix: string, n: number) { return `${prefix}-${String(n).padStart(5, '0')}`; }

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [running, setRunning] = useState(true);
  const [speed, setSpeedState] = useState(1);
  const [tick, setTick] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>(seed.alerts);
  const [incidents, setIncidents] = useState<Incident[]>(seed.incidents);
  const [drones, setDrones] = useState<DiconDataset['drones']>(seed.drones);
  const [simDrones, setSimDrones] = useState<SimulatedDrone[]>(seed.simulatedDrones);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const seenZoneEntry = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function loop() {
      if (running) setTick(t => t + 1);
      rafRef.current = window.setTimeout(loop, 400) as unknown as number;
    }
    loop();
    return () => { if (rafRef.current) clearTimeout(rafRef.current); };
  }, [running]);

  const liveDrones: LiveDrone[] = useMemo(() => {
    const elapsedS = (tick * 0.4) * speed;
    return simDrones.map((d, idx) => {
      const cycleSeconds = 90 + (idx % 5) * 15; // vary period per drone
      const phase = (elapsedS / cycleSeconds + idx * 0.13) % 1;
      const p = interpolatePath(d.path, phase);
      const pNext = interpolatePath(d.path, Math.min(phase + 0.01, 1));
      const heading = bearing(p, pNext);
      let inZoneId: string | null = null;
      for (const z of seed.zones) {
        if (distMeters(p, z.center) <= z.radiusM) { inZoneId = z.id; break; }
      }
      return {
        ...d,
        lat: p.lat, lng: p.lng, altitude: Math.round(p.altitude),
        heading: Math.round(heading),
        signal: 70 + Math.round(Math.sin(elapsedS / 5 + idx) * 20),
        lastDetection: new Date().toISOString(),
        inZoneId,
      };
    });
  }, [tick, speed, simDrones]);

  // Detect restricted-zone entries and raise alerts (once per entry).
  useEffect(() => {
    liveDrones.forEach(d => {
      const zone = seed.zones.find(z => z.id === d.inZoneId);
      if (zone && zone.type === 'Demo Restricted Zone') {
        const key = `${d.id}:${zone.id}`;
        if (!seenZoneEntry.current.has(key)) {
          seenZoneEntry.current.add(key);
          setAlerts(prev => [{
            id: idFor('ALT', prev.length + 1000),
            type: 'Restricted Zone Entry',
            severity: 'High',
            droneId: d.id,
            zoneId: zone.id,
            timestamp: new Date().toISOString(),
            status: 'Open',
            description: `Drone ${d.id} (${d.model}) entered ${zone.name}.`,
          }, ...prev]);
        }
      } else {
        seenZoneEntry.current.forEach(key => {
          if (key.startsWith(`${d.id}:`) && d.inZoneId === null) seenZoneEntry.current.delete(key);
        });
      }
    });
  }, [liveDrones]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setTick(0);
    setSimDrones(seed.simulatedDrones);
    setDrones(seed.drones);
    setAlerts(seed.alerts);
    setIncidents(seed.incidents);
    seenZoneEntry.current.clear();
    setRunning(true);
  }, []);
  const setSpeed = useCallback((n: number) => setSpeedState(n), []);
  const selectDrone = useCallback((id: string | null) => setSelectedDroneId(id), []);

  const addUnknownDrone = useCallback(() => {
    const c = seed.center;
    const jitter = () => (Math.random() - 0.5) * 0.09;
    const idNum = 2000 + simDrones.length;
    const newDrone: SimulatedDrone = {
      id: `UNK-${idNum}`,
      manufacturer: 'Unknown',
      model: 'Unresolved Signature',
      serialNumber: null,
      identityStatus: 'UNRESOLVED',
      ownerRef: null,
      operatorName: null,
      purpose: null,
      registrationState: 'Unknown',
      purchaseId: null,
      vendorId: null,
      path: [
        { lat: c.lat + jitter(), lng: c.lng + jitter(), altitude: 60 },
        { lat: c.lat + jitter(), lng: c.lng + jitter(), altitude: 90 },
      ],
      speedKph: 40,
      detectionSource: 'Simulated Sensor Network',
    };
    setSimDrones(prev => [...prev, newDrone]);
    setAlerts(prev => [{
      id: idFor('ALT', prev.length + 2000),
      type: 'Unknown Drone',
      severity: 'Medium',
      droneId: newDrone.id,
      zoneId: null,
      timestamp: new Date().toISOString(),
      status: 'Open',
      description: `New unidentified drone signature detected: ${newDrone.id}.`,
    }, ...prev]);
  }, [simDrones]);

  const resolveIdentity = useCallback((droneId: string) => {
    setSimDrones(prev => prev.map(d => d.id === droneId ? {
      ...d,
      identityStatus: 'MATCHED',
      manufacturer: 'Kestrel Robotics',
      model: 'Kestrel Nano',
      serialNumber: 'RESOLVED-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      operatorName: 'Field Operator (Resolved)',
      purpose: 'Survey / Mapping',
      registrationState: 'Registered',
    } : d));
  }, []);

  const triggerRestrictedZoneEntry = useCallback(() => {
    const target = liveDrones[0];
    const zone = seed.zones.find(z => z.type === 'Demo Restricted Zone');
    if (!target || !zone) return;
    setSimDrones(prev => prev.map(d => d.id === target.id ? {
      ...d,
      path: [{ lat: zone.center.lat, lng: zone.center.lng, altitude: 80 }, ...d.path],
    } : d));
  }, [liveDrones]);

  const triggerAlert = useCallback((type: string) => {
    const target = liveDrones[Math.floor(Math.random() * liveDrones.length)];
    setAlerts(prev => [{
      id: idFor('ALT', prev.length + 3000),
      type,
      severity: type === 'Lost Telemetry' ? 'Medium' : 'High',
      droneId: target?.id ?? 'UNKNOWN',
      zoneId: null,
      timestamp: new Date().toISOString(),
      status: 'Open',
      description: `${type} triggered for demonstration on drone ${target?.id ?? 'unknown'}.`,
    }, ...prev]);
  }, [liveDrones]);

  const triggerLostTelemetry = useCallback(() => triggerAlert('Lost Telemetry'), [triggerAlert]);

  const createIncidentFromAlert = useCallback((alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    setIncidents(prev => [{
      id: idFor('INC', prev.length + 100),
      type: alert.type,
      droneId: alert.droneId,
      relatedAlertIds: [alert.id],
      severity: alert.severity,
      location: 'Demo Operating Area',
      time: alert.timestamp,
      status: 'Open',
      description: `Incident created from alert ${alert.id}: ${alert.description}`,
      assignedTo: 'Unassigned',
      timeline: [
        { time: alert.timestamp, event: 'Alert triggered', actor: 'System' },
        { time: new Date().toISOString(), event: 'Incident created', actor: 'DICON Command Operator' },
      ],
    }, ...prev]);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' } : a));
  }, [alerts]);

  const updateIncidentStatus = useCallback((incidentId: string, status: string) => {
    setIncidents(prev => prev.map(i => i.id === incidentId ? {
      ...i, status,
      timeline: [...i.timeline, { time: new Date().toISOString(), event: `Status changed to ${status}`, actor: 'DICON Command Operator' }],
    } : i));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' } : a));
  }, []);

  const value = useMemo(() => ({
    running, speed, liveDrones, zones: seed.zones, alerts, incidents,
    operators: seed.operators, flights: seed.flights, dataSources: seed.dataSources,
    drones, center: seed.center, meta: seed.meta, selectedDroneId,
    start, pause, reset, setSpeed, selectDrone, addUnknownDrone, resolveIdentity,
    triggerRestrictedZoneEntry, triggerAlert, triggerLostTelemetry, createIncidentFromAlert,
    updateIncidentStatus, acknowledgeAlert,
  }), [running, speed, liveDrones, alerts, incidents, drones, selectedDroneId, start, pause, reset,
      setSpeed, selectDrone, addUnknownDrone, resolveIdentity, triggerRestrictedZoneEntry,
      triggerAlert, triggerLostTelemetry, createIncidentFromAlert, updateIncidentStatus, acknowledgeAlert]);

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
