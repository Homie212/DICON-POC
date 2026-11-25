import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useSimulation, type LiveDrone } from '../lib/simulation';

const ZONE_COLOR: Record<string, string> = {
  'Monitored Zone': '#34B8A6',
  'Demo Restricted Zone': '#E2534D',
  'Alert Zone': '#E8A33D',
  'Custom Demo Zone': '#8C9CA1',
};

const IDENTITY_COLOR: Record<string, string> = {
  MATCHED: '#34B8A6',
  'PARTIAL MATCH': '#E8A33D',
  UNRESOLVED: '#E2534D',
  CONFLICT: '#E2534D',
  SIMULATED: '#8C9CA1',
};

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom(), { animate: false }); }, []); // eslint-disable-line
  return null;
}

export default function MapView({ onSelect }: { onSelect: (id: string) => void }) {
  const { liveDrones, zones, center, selectedDroneId } = useSimulation();

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: '#0A0D0F' }}
    >
      <Recenter lat={center.lat} lng={center.lng} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />

      {zones.map(z => (
        <Circle
          key={z.id}
          center={[z.center.lat, z.center.lng]}
          radius={z.radiusM}
          pathOptions={{ color: ZONE_COLOR[z.type], fillColor: ZONE_COLOR[z.type], fillOpacity: 0.08, weight: 1.5, dashArray: z.type === 'Demo Restricted Zone' ? '6 4' : undefined }}
        >
          <LeafletTooltip direction="top" opacity={0.9} className="font-mono text-xs">{z.name} · {z.type}</LeafletTooltip>
        </Circle>
      ))}

      {liveDrones.map((d: LiveDrone) => {
        const color = IDENTITY_COLOR[d.identityStatus] ?? '#8C9CA1';
        const path = d.path.map(p => [p.lat, p.lng]) as [number, number][];
        const isSelected = d.id === selectedDroneId;
        return (
          <React.Fragment key={d.id}>
            <Polyline positions={path} pathOptions={{ color, weight: 1, opacity: 0.35, dashArray: '2 6' }} />
            <CircleMarker
              center={[d.lat, d.lng]}
              radius={isSelected ? 8 : 6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.65,
                weight: isSelected ? 2.5 : 1.5,
              }}
              eventHandlers={{ click: () => onSelect(d.id) }}
            >
              <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.95} className="font-mono text-xs">
                {d.id} · {d.model} · {d.altitude}m
              </LeafletTooltip>
            </CircleMarker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
