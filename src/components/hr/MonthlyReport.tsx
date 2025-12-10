import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';

interface MonthlyReportProps {
    isDarkMode: boolean;
}

export function MonthlyReport({ isDarkMode }: MonthlyReportProps) {
    const attendanceData = [
        { name: 'Week 1', present: 40, late: 2, absent: 1 },
        { name: 'Week 2', present: 38, late: 4, absent: 1 },
        { name: 'Week 3', present: 42, late: 1, absent: 0 },
        { name: 'Week 4', present: 41, late: 2, absent: 0 },
    ];

    const costData = [
        { name: 'Week 1', cost: 12000 },
        { name: 'Week 2', cost: 12500 },
        { name: 'Week 3', cost: 11800 },
        { name: 'Week 4', cost: 13000 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Monthly Analytics</h2>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors bg-white text-gray-700 shadow-sm">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Staff Attendance Trends</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Labour Cost Chart */}
                <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Labour Costs</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={costData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="cost" name="Cost (RM)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Attendance</div>
                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>96.5%</div>
                </div>
                <div className={`p-6 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Labour Cost</div>
                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM 49,300</div>
                </div>
                <div className={`p-6 rounded-xl border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productivity Score</div>
                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9.2/10</div>
                </div>
            </div>
        </div>
    );
}
