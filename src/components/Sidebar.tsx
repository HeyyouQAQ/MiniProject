import { LogOut } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  menuItems: MenuItem[];
  onLogout: () => void;
  roleLabel?: string;
}

export function Sidebar({
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  isDarkMode,
  menuItems,
  onLogout,
  roleLabel = "Staff Portal"
}: SidebarProps) {

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
            <div className="text-red-600 font-bold">WcDonald</div>
            <div className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{roleLabel}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 md:py-3 rounded-lg transition-all duration-300 text-left transform hover:scale-105 ${isActive
                    ? 'bg-red-50 text-red-600 shadow-md'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" />
                <span className="text-base md:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`pt-4 mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left hover:bg-red-50 hover:text-red-600 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}