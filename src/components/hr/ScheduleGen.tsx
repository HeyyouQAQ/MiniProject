import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ScheduleGenProps {
    isDarkMode: boolean;
}

export function ScheduleGen({ isDarkMode }: ScheduleGenProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Mock calendar days
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const shifts = [
        { day: 10, staff: 'John Doe', time: '08:00 - 16:00' },
        { day: 10, staff: 'Jane Smith', time: '16:00 - 24:00' },
        { day: 11, staff: 'Bob Johnson', time: '08:00 - 16:00' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>December 2025 Schedule</h2>
                <div className="flex gap-2">
                    <button className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto flex-1 flex flex-col">
                    <div className="min-w-[800px] flex-1 flex flex-col">
                        {/* Calendar Header */}
                        <div className={`grid grid-cols-7 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className={`p-4 text-center text-sm font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>-- {day} --</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className={`grid grid-cols-7 flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {/* Offset for start of month (mock) */}
                            <div className={`border-b border-r min-h-[100px] ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}></div>
                            <div className={`border-b border-r min-h-[100px] ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}></div>

                            {days.map(day => {
                                const dayShifts = shifts.filter(s => s.day === day);

                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`
                      relative p-2 border-b border-r min-h-[100px] transition-colors cursor-pointer group
                      ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-red-50'}
                      ${selectedDay === day ? (isDarkMode ? 'bg-gray-700 ring-2 ring-inset ring-red-500' : 'bg-red-50 ring-2 ring-inset ring-red-500') : ''}
                    `}
                                    >
                                        <span className={`absolute top-2 right-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{day}</span>

                                        <div className="mt-6 space-y-1">
                                            {dayShifts.map((shift, idx) => (
                                                <div key={idx} className={`text-xs p-1.5 rounded truncate ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`}>
                                                    {shift.time.split('-')[0]} {shift.staff}
                                                </div>
                                            ))}
                                            <div className="hidden group-hover:flex items-center justify-center p-1 mt-1 text-red-500">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
