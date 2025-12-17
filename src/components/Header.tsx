import { Bell, User, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen, isDarkMode, setIsDarkMode }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className={`border-b px-4 md:px-6 lg:px-8 py-4 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>

          <div>
            <h1 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Hello, {user?.name ? user.name.split(' ')[0] : 'Staff'}
            </h1>
            <div className={`flex items-center gap-2 md:gap-4 text-xs md:text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>{formatTime(currentTime)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <div className="relative w-5 h-5">
              <Moon
                className={`w-5 h-5 absolute inset-0 transition-all duration-500 ${isDarkMode
                  ? 'rotate-90 scale-0 opacity-0'
                  : 'rotate-0 scale-100 opacity-100 text-gray-600'
                  }`}
              />
              <Sun
                className={`w-5 h-5 absolute inset-0 transition-all duration-500 ${isDarkMode
                  ? 'rotate-0 scale-100 opacity-100 text-yellow-400'
                  : '-rotate-90 scale-0 opacity-0'
                  }`}
              />
            </div>
          </button>

          <button className={`relative p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Bell className={`w-5 h-5 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          </button>

          <div className={`hidden sm:flex items-center gap-3 pl-4 border-l transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : ''}`}>
            <div className="text-right hidden md:block">
              <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                {user?.name || 'Staff User'}
              </div>
              <div className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {(() => {
                  if (!user?.role) return 'Staff Member';
                  const role = user.role.toLowerCase();
                  if (role === 'hr') return 'HR';
                  if (role === 'worker') return 'Staff';
                  return role.charAt(0).toUpperCase() + role.slice(1);
                })()}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <User className={`w-5 h-5 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
          </div>

          <div className={`sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <User className={`w-4 h-4 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </div>
        </div>
      </div>
    </header>
  );
}