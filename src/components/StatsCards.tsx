import { useState, useEffect } from 'react';
import { Clock, DollarSign, Umbrella } from 'lucide-react';
import { fetchApi } from '../utils/api';

interface StatsCardsProps {
  isDarkMode?: boolean;
}

export function StatsCards({ isDarkMode = false }: StatsCardsProps) {
  const [stats, setStats] = useState({
    hoursWorked: 0,
    otHours: 0,
    lastPay: 'RM 0.00',
    payPeriod: 'No Data',
    prevPay: 'vs Last Month: N/A',
    leaveTaken: 0,
    leaveBreakdown: 'None'
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.id) {
          const response = await fetchApi(`staff_stats.php?userId=${user.id}`);
          if (response.status === 'success') {
            setStats(response.data);
          }
        }
      } catch (e) {
        console.error("Failed to load staff stats", e);
      }
    };
    loadStats();
  }, []);

  const cards = [
    {
      title: 'Hours Worked',
      value: `${stats.hoursWorked}`,
      subtitle: 'This week',
      icon: Clock,
      detail: `Overtime: ${stats.otHours} hours`,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      darkColor: 'bg-blue-900 bg-opacity-30',
    },
    {
      title: 'Latest Salary',
      value: stats.lastPay,
      subtitle: stats.payPeriod,
      icon: DollarSign,
      detail: stats.prevPay || 'vs Last Month: N/A',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      darkColor: 'bg-green-900 bg-opacity-30',
    },
    {
      title: 'Total Leave Taken',
      value: `${stats.leaveTaken} Days`,
      subtitle: 'Approved this year',
      icon: Umbrella,
      detail: stats.leaveBreakdown || 'None',
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      darkColor: 'bg-yellow-900 bg-opacity-30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div key={idx} className={`rounded-lg shadow-sm p-6 transition-all duration-500 hover:shadow-lg transform hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? card.darkColor : card.color}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>

            <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.title}</div>
            <div className={`text-3xl mb-1 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>{card.value}</div>
            <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.subtitle}</div>

            <div className={`mt-4 pt-4 border-t transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}