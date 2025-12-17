import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Loader2, FileText, TrendingUp, DollarSign, Users } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MonthlyReportProps {
    isDarkMode: boolean;
}

interface ReportData {
    attendance: any[];
    costs: any[];
    leaves: any[]; // Added for leave trends
    stats: {
        avgAttendance: string;
        totalCost: string;
        avgLeavePerEmployee: number; // Changed from totalLeaveDays
    }
}

export function MonthlyReport({ isDarkMode }: MonthlyReportProps) {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    const handleGenerateReport = async (format = 'json') => {
        setIsLoading(true);
        setError('');
        try {
            if (format === 'csv') {
                const apiBaseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost/MiniProjectyeow/MiniProject/public/api';
                const response = await fetch(`${apiBaseUrl}/reports.php?action=generate_report&month=${month}&year=${year}&format=${format}`);

                if (!response.ok) throw new Error('Failed to fetch CSV');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `monthly_report_${year}_${month}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const response = await fetchApi(`reports.php?action=generate_report&month=${month}&year=${year}&format=${format}`, {
                    method: 'GET',
                });

                if (response.status === 'success') {
                    setReportData(response.data);
                } else {
                    setError(response.message || 'Failed to generate report.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGenerateReport();
    }, []);

    const cardClass = `rounded-lg shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;

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

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Monthly Analytics Report
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Generate insights for attendance, costs, and productivity
                    </p>
                </div>
            </div>

            {/* Controls Card */}
            <div className={cardClass}>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Period:</span>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className={`w-[140px] ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthNames.map((name, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className={`w-[100px] ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                                        {new Date().getFullYear() - i}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => handleGenerateReport('json')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626', color: 'white' }}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                            Generate Report
                        </button>
                        <button
                            onClick={() => handleGenerateReport('csv')}
                            disabled={isLoading}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            {!reportData && !isLoading && (
                <div className={`${cardClass} text-center py-12`}>
                    <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        No Report Generated
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Select a month and year, then click "Generate Report" to view analytics
                    </p>
                </div>
            )}

            {reportData && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cardClass}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                                    <Users className="w-5 h-5" style={{ color: '#16a34a' }} />
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Attendance</p>
                                    <p className={`text-2xl font-bold`} style={{ color: '#16a34a' }}>{reportData.stats.avgAttendance}</p>
                                </div>
                            </div>
                        </div>
                        <div className={cardClass}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffedd5' }}>
                                    <FileText className="w-5 h-5" style={{ color: '#ea580c' }} />
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Leave/Employee</p>
                                    <p className={`text-2xl font-bold`} style={{ color: '#ea580c' }}>{reportData.stats.avgLeavePerEmployee} days</p>
                                </div>
                            </div>
                        </div>
                        <div className={cardClass}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef2f2' }}>
                                    <DollarSign className="w-5 h-5" style={{ color: '#dc2626' }} />
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Labour Cost</p>
                                    <p className={`text-2xl font-bold`} style={{ color: '#dc2626' }}>{reportData.stats.totalCost}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className={cardClass}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Weekly Attendance Trends
                            </h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={reportData.attendance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="present" name="Present" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="on_leave" name="On Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="absent" name="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Weekly Labour Costs
                            </h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={reportData.costs}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="cost"
                                            name="Cost (RM)"
                                            stroke="#dc2626"
                                            strokeWidth={3}
                                            dot={{ r: 6, fill: '#dc2626' }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Weekly Leave Distribution
                            </h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={reportData.leaves}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="Annual" name="Annual" stackId="a" fill="#059669" />
                                        <Bar dataKey="Sick" name="Sick" stackId="a" fill="#db2777" />
                                        <Bar dataKey="Unpaid" name="Unpaid" stackId="a" fill="#d97706" />
                                        <Bar dataKey="Other" name="Other" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

