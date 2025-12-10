import { useState } from 'react';
import { ManagerSidebar } from './ManagerSidebar';
import { ManagerHeader } from './ManagerHeader';
import { ManagerOverview } from './ManagerOverview';
import { SystemConfig } from './SystemConfig';
import { AccountCreation as AccountManagement } from './AccountCreation';

interface ManagerDashboardProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

export function ManagerDashboard({ isDarkMode, onLogout }: ManagerDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);

  // In a real app, this might lift dark mode state up further
  const toggleDarkMode = () => {
    setLocalIsDarkMode(!localIsDarkMode);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ManagerOverview isDarkMode={localIsDarkMode} />;
      case 'system-config':
        return <SystemConfig isDarkMode={localIsDarkMode} />;
      case 'accounts':
        return <AccountManagement isDarkMode={localIsDarkMode} />;
      default:
        return (
          <div className={`p-8 rounded-3xl text-center ${localIsDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-xl font-medium mb-2">Coming Soon</div>
            <p>The {activeSection} module is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 font-sans ${localIsDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ManagerSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDarkMode={localIsDarkMode}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <ManagerHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={localIsDarkMode}
          setIsDarkMode={toggleDarkMode}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
