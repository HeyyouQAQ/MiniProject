import { LayoutDashboard, Users, Settings, LogOut, CreditCard } from 'lucide-react';

interface ManagerSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  onLogout?: () => void;
}

export function ManagerSidebar({ activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen, isDarkMode, onLogout }: ManagerSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Account Management', icon: Users },
    { id: 'system-config', label: 'System Configuration', icon: Settings },
    { id: 'financial-profile', label: 'Employee Financial Profile', icon: CreditCard },
  ];

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-40
      w-64 border-r flex flex-col
      transform transition-all duration-500 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      <div className={`p-6 border-b transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
            <span className="text-white text-xl">W</span>
          </div>
          <div>
            <div className="text-red-600">WcDonald</div>
            <div className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manager Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left transform hover:scale-105 ${isActive
                  ? 'bg-red-50 text-red-600 shadow-md'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`pt-4 border-t mt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => onLogout?.()}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left transform hover:scale-105 ${isDarkMode
              ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400'
              : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
              }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
