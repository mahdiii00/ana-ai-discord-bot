import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Servers from './pages/Servers';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Security from './pages/Security';
import AIConfig from './pages/AIConfig';
import Logs from './pages/Logs';
import Tickets from './pages/Tickets';
import Analytics from './pages/Analytics';
import Backups from './pages/Backups';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/servers" element={<Servers />} />
      <Route path="/dashboard/:guildId" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="security" element={<Security />} />
        <Route path="ai" element={<AIConfig />} />
        <Route path="logs" element={<Logs />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="backups" element={<Backups />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
