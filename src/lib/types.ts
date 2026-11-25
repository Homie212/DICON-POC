export interface Operator {
  id: string;
  name: string;
  organization: string | null;
  verification: string;
}

export interface Zone {
  id: string;
  name: string;
  type: 'Monitored Zone' | 'Demo Restricted Zone' | 'Alert Zone' | 'Custom Demo Zone';
  center: { lat: number; lng: number };
  radiusM: number;
}

export interface PathPoint { lat: number; lng: number; altitude: number }

export interface SimulatedDrone {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string | null;
  identityStatus: 'MATCHED' | 'PARTIAL MATCH' | 'UNRESOLVED' | 'CONFLICT' | 'SIMULATED';
  ownerRef: string | null;
  operatorName: string | null;
  purpose: string | null;
  registrationState: string;
  purchaseId: string | null;
  vendorId: string | null;
  path: PathPoint[];
  speedKph: number;
  detectionSource: string;
}

export interface DiconDrone {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  ownerName: string;
  ownerOrg: string | null;
  operatorName: string;
  declaredPurpose: string;
  status: string;
  registrationState: string;
  source: string;
  commercialReference: { purchaseId: string; vendorName: string | null };
}

export interface Flight {
  id: string;
  droneId: string;
  operatorName: string;
  start: string;
  end: string;
  durationMin: number;
  location: string;
  purpose: string;
  status: string;
  alertCount: number;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  droneId: string;
  zoneId: string | null;
  timestamp: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  description: string;
}

export interface Incident {
  id: string;
  type: string;
  droneId: string;
  relatedAlertIds: string[];
  severity: string;
  location: string;
  time: string;
  status: string;
  description: string;
  assignedTo: string;
  timeline: { time: string; event: string; actor: string }[];
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
}

export interface DiconDataset {
  meta: { generated: string; note: string; integration: string };
  center: { lat: number; lng: number };
  operators: Operator[];
  zones: Zone[];
  simulatedDrones: SimulatedDrone[];
  flights: Flight[];
  alerts: Alert[];
  incidents: Incident[];
  dataSources: DataSource[];
  drones: DiconDrone[];
}
