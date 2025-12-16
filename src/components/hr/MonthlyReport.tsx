import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MonthlyReportProps {
    isDarkMode: boolean;
}

interface ReportData {
    attendance: any[];
    costs: any[];
    stats: {
        avgAttendance: string;
        totalCost: string;
        productivityScore: string;
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
            const response = await fetchApi(`reports.php?action=generate_report&month=${month}&year=${year}&format=${format}`, {
                method: 'GET', // Using GET for simplicity, could be POST
            });

            if (format === 'csv') {
                const blob = new Blob([response], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `monthly_report_${year}_${month}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
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
                <div className="flex gap-2 items-center">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({length: 12}, (_, i) => <SelectItem key={i+1} value={(i+1).toString()}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({length: 5}, (_, i) => <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>{new Date().getFullYear() - i}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => handleGenerateReport('json')} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport('csv')} disabled={isLoading}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>
            </div>
             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            {reportData && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Staff Attendance Trends</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.attendance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                        <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="on_leave" name="On Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Labour Costs</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportData.costs}>
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
                            <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.avgAttendance}</div>
                        </div>
                        <div className={`p-6 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Labour Cost</div>
                            <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.totalCost}</div>
                        </div>
                        <div className={`p-6 rounded-xl border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Productivity Score</div>
                            <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reportData.stats.productivityScore}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
