import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { HRDashboard } from './components/hr/HRDashboard';
import { SetPassword } from './components/SetPassword';

export default function App() {
  const [userRole, setUserRole] = useState<'staff' | 'manager' | 'hr' | null>(null);
  const [isDarkMode] = useState(false);
  const [isSetPasswordMode, setIsSetPasswordMode] = useState(false);

  useEffect(() => {
    // Check for token in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      setIsSetPasswordMode(true);
    }
  }, []);

  const handleLogin = (role: 'staff' | 'manager' | 'hr') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (isSetPasswordMode) {
    return <SetPassword />;
  }

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'manager') {
    return <ManagerDashboard isDarkMode={isDarkMode} onLogout={handleLogout} />;
  }

  if (userRole === 'hr') {
    return <HRDashboard onLogout={handleLogout} />;
  }

  // Default to staff
  return <StaffDashboard onLogout={handleLogout} />;
}