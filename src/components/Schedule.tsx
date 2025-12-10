import { Calendar, Clock } from 'lucide-react';

interface ScheduleProps {
  isDarkMode?: boolean;
}

export function Schedule({ isDarkMode = false }: ScheduleProps) {
  const scheduleData = [
    { day: 'Mon', date: 'Dec 9', shift: '8:00 AM - 4:00 PM', hours: '8h' },
    { day: 'Tue', date: 'Dec 10', shift: '8:00 AM - 4:00 PM', hours: '8h' },
    { day: 'Wed', date: 'Dec 11', shift: 'Off', hours: '-' },
    { day: 'Thu', date: 'Dec 12', shift: '12:00 PM - 8:00 PM', hours: '8h' },
    { day: 'Fri', date: 'Dec 13', shift: '8:00 AM - 4:00 PM', hours: '8h' },
    { day: 'Sat', date: 'Dec 14', shift: '10:00 AM - 6:00 PM', hours: '8h' },
    { day: 'Sun', date: 'Dec 15', shift: 'Off', hours: '-' },
  ];

  return (
    <div className={`rounded-lg shadow-sm p-4 md:p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className={`flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
          <Calendar className="w-5 h-5 text-red-600" />
          <span className="hidden sm:inline">Schedule</span>
          <span className="sm:hidden">This Week</span>
        </h2>
        <button className="text-red-600 hover:underline text-sm">View All</button>
      </div>
      
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex gap-2 md:gap-3 pb-2">
          {scheduleData.map((item, idx) => {
            const isToday = idx === 0;
            const isOff = item.shift === 'Off';
            
            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-28 md:flex-1 md:min-w-[140px] p-3 md:p-4 rounded-lg border-2 transition-all duration-500 transform hover:scale-105 ${
                  isToday
                    ? 'border-red-600 bg-red-50 shadow-lg'
                    : isOff
                    ? isDarkMode
                      ? 'border-gray-700 bg-gray-700'
                      : 'border-gray-200 bg-gray-50'
                    : isDarkMode
                    ? 'border-gray-700 bg-gray-700'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className={`text-sm transition-colors duration-500 ${isToday ? 'text-red-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.day}
                  </div>
                  <div className={`mb-2 transition-colors duration-500 ${isToday ? 'text-red-600' : isDarkMode ? 'text-white' : ''}`}>
                    {item.date}
                  </div>
                  <div className={`text-xs md:text-sm transition-colors duration-500 ${
                    isOff ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : isDarkMode ? 'text-gray-300' : ''
                  }`}>
                    {!isOff && <Clock className="w-3 h-3 inline mr-1" />}
                    <div className="mt-1">{item.shift}</div>
                  </div>
                  {!isOff && (
                    <div className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.hours}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}