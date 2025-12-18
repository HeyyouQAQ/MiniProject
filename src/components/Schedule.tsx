import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { fetchApi } from '../utils/api';

interface ScheduleProps {
  isDarkMode?: boolean;
}

interface ScheduleItem {
  ScheduleID: number;
  ShiftDate: string;
  StartTime: string | null;
  EndTime: string | null;
  TaskDescription: string;
  Status: string;
}

export function Schedule({ isDarkMode = false }: ScheduleProps) {
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.id) {
          const response = await fetchApi(`schedule.php?action=get_staff_schedule&userId=${user.id}`);
          if (response.status === 'success') {
            // Transform API data to display format
            const apiData = response.data || [];

            // Generate dates for this week
            const monday = new Date();
            monday.setDate(monday.getDate() - monday.getDay() + 1);

            const weekDays = [];
            for (let i = 0; i < 7; i++) {
              const date = new Date(monday);
              date.setDate(monday.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];

              // Find schedule for this day
              const schedule = apiData.find((s: ScheduleItem) => s.ShiftDate === dateStr);

              let shift = 'Off';
              let hours = '-';

              if (schedule) {
                if (schedule.Status === 'Off') {
                  shift = 'Off';
                } else if (schedule.StartTime && schedule.EndTime) {
                  shift = formatTime(schedule.StartTime) + ' - ' + formatTime(schedule.EndTime);
                  hours = calculateHours(schedule.StartTime, schedule.EndTime);
                }
              }

              weekDays.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                shift,
                hours,
                task: schedule?.TaskDescription || ''
              });
            }

            setScheduleData(weekDays);
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        // Fallback to empty schedule
        generateEmptyWeek();
      } finally {
        setIsLoading(false);
      }
    };

    const generateEmptyWeek = () => {
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDays.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          shift: 'Off',
          hours: '-',
          task: ''
        });
      }
      setScheduleData(weekDays);
    };

    fetchSchedule();
  }, []);

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const calculateHours = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const diff = endMins - startMins;
    const hours = Math.floor(diff / 60);
    return `${hours}h`;
  };

  // Check if a date is today
  const isToday = (dateStr: string) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return dateStr === today;
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center py-4">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-sm p-4 md:p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className={`flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
          <Calendar className="w-5 h-5 text-red-600" />
          <span className="hidden sm:inline">My Schedule</span>
          <span className="sm:hidden">This Week</span>
        </h2>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex gap-2 md:gap-3 pb-2">
          {scheduleData.map((item, idx) => {
            const today = isToday(item.date);
            const isOff = item.shift === 'Off';

            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-28 md:flex-1 md:min-w-[140px] p-3 md:p-4 rounded-lg border-2 transition-all duration-500 transform hover:scale-105 ${today
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
                  <div className={`text-sm transition-colors duration-500 ${today ? 'text-red-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.day}
                  </div>
                  <div className={`mb-2 transition-colors duration-500 ${today ? 'text-red-600' : isDarkMode ? 'text-white' : ''}`}>
                    {item.date}
                  </div>
                  <div className={`text-xs md:text-sm transition-colors duration-500 ${isOff ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : isDarkMode ? 'text-gray-300' : ''
                    }`}>
                    {!isOff && <Clock className="w-3 h-3 inline mr-1" />}
                    <div className="mt-1">{item.shift}</div>
                  </div>
                  {!isOff && (
                    <div className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.hours}</div>
                  )}
                  {item.task && (
                    <div className={`text-xs mt-2 px-1 py-0.5 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {item.task}
                    </div>
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