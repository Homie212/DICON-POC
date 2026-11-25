import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './lib/simulation';
import Layout from './components/Layout';
import Login from './pages/Login';
import CommandCenter from './pages/CommandCenter';
import DroneRegistry from './pages/DroneRegistry';
import DroneDetail from './pages/DroneDetail';
import Operators from './pages/Operators';
import FlightHistory from './pages/FlightHistory';
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import DemoControls from './pages/DemoControls';

function Shell({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Shell><CommandCenter /></Shell>} />
          <Route path="/drones" element={<Shell><DroneRegistry /></Shell>} />
          <Route path="/drones/:id" element={<Shell><DroneDetail /></Shell>} />
          <Route path="/operators" element={<Shell><Operators /></Shell>} />
          <Route path="/flights" element={<Shell><FlightHistory /></Shell>} />
          <Route path="/alerts" element={<Shell><Alerts /></Shell>} />
          <Route path="/incidents" element={<Shell><Incidents /></Shell>} />
          <Route path="/incidents/:id" element={<Shell><IncidentDetail /></Shell>} />
          <Route path="/reports" element={<Shell><Reports /></Shell>} />
          <Route path="/audit" element={<Shell><Audit /></Shell>} />
          <Route path="/demo-controls" element={<Shell><DemoControls /></Shell>} />
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}
