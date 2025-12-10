import { Clock, DollarSign, StickyNote } from 'lucide-react';

interface StatsCardsProps {
  isDarkMode?: boolean;
}

export function StatsCards({ isDarkMode = false }: StatsCardsProps) {
  const cards = [
    {
      title: 'Hours Worked',
      value: '38.5',
      subtitle: 'This week',
      icon: Clock,
      detail: 'Overtime: 2.5 hours',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      darkColor: 'bg-blue-900 bg-opacity-30',
    },
    {
      title: 'Salary',
      value: 'RM 892.50',
      subtitle: 'Current period',
      icon: DollarSign,
      detail: 'Last pay: RM 945.00',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      darkColor: 'bg-green-900 bg-opacity-30',
    },
    {
      title: 'Notes',
      value: '3',
      subtitle: 'Active notes',
      icon: StickyNote,
      detail: 'Last updated: Today',
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