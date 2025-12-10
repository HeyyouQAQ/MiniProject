import { useState } from 'react';
import { Login } from './components/Login';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { HRDashboard } from './components/hr/HRDashboard';

export default function App() {
  const [userRole, setUserRole] = useState<'staff' | 'manager' | 'hr' | null>(null);

  const handleLogin = (role: 'staff' | 'manager' | 'hr') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'manager') {
    return <ManagerDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'hr') {
    return <HRDashboard onLogout={handleLogout} />;
  }

  // Default to staff
  return <StaffDashboard onLogout={handleLogout} />;
}