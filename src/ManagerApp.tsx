import { useState } from 'react';
import { ManagerSidebar } from './components/manager/ManagerSidebar';
import { ManagerHeader } from './components/manager/ManagerHeader';
import { AccountCreation } from './components/manager/AccountCreation';
import { SystemConfig } from './components/manager/SystemConfig';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ChatBot } from './components/ChatBot';

export default function ManagerApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ManagerSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
      />
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <ManagerHeader 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {activeSection === 'dashboard' && (
            <ManagerDashboard isDarkMode={isDarkMode} />
          )}
          
          {activeSection === 'accounts' && (
            <AccountCreation isDarkMode={isDarkMode} />
          )}
          
          {activeSection === 'system-config' && (
            <SystemConfig isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
      
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} isDarkMode={isDarkMode} />
    </div>
  );
}
