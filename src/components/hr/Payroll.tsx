import { useState, useEffect } from 'react';
import { Download, CheckCircle, Calculator, Loader2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface PayrollRecord {
    Name: string;
    RoleName: string;
    TotalHours: number;
    GrossPay: number;
    Deductions: number;
    NetPay: number;
}

interface PayrollProps {
    isDarkMode: boolean;
}

export function Payroll({ isDarkMode }: PayrollProps) {
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchPayrolls = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetchApi('payroll.php?action=get_all_payrolls');
            if (response.status === 'success') {
                setPayrolls(response.data);
            } else {
                setError(response.message || 'Failed to fetch payrolls.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch initially if there are any payrolls to show
        // fetchPayrolls();
    }, []);

    const handleGeneratePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setError('');
        try {
            const response = await fetchApi('payroll.php?action=generate_payroll', {
                method: 'POST',
                body: JSON.stringify({ startDate, endDate }),
            });
            if (response.status === 'success') {
                setPayrolls(response.data);
            } else {
                setError(response.message || 'Failed to generate payroll.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
                <form onSubmit={handleGeneratePayroll} className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payroll Generation</h2>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a date range to generate payroll.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div>
                            <Label htmlFor="start-date" className="sr-only">Start Date</Label>
                            <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={isDarkMode ? 'bg-gray-700' : ''} />
                        </div>
                        <div>
                            <Label htmlFor="end-date" className="sr-only">End Date</Label>
                            <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={isDarkMode ? 'bg-gray-700' : ''} />
                        </div>
                        <Button type="submit" disabled={isGenerating || !startDate || !endDate}>
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                            <span className="ml-2">Generate</span>
                        </Button>
                    </div>
                </form>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

            {isLoading ? (
                <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : payrolls.length > 0 && (
                <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                        <table className={`w-full text-left min-w-[800px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <thead className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'} uppercase text-xs font-semibold tracking-wider`}>
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Total Hours</th>
                                    <th className="p-4">Gross Pay</th>
                                    <th className="p-4">Deductions</th>
                                    <th className="p-4 text-right">Net Pay</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'}`}>
                                {payrolls.map((emp, idx) => (
                                    <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <td className={`p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.Name}</td>
                                        <td className="p-4">{emp.RoleName}</td>
                                        <td className="p-4">{emp.TotalHours.toFixed(2)}h</td>
                                        <td className="p-4">RM {emp.GrossPay.toFixed(2)}</td>
                                        <td className="p-4 text-red-600">-RM {emp.Deductions.toFixed(2)}</td>
                                        <td className={`p-4 text-right font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {emp.NetPay.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <button className="text-red-600 hover:underline flex items-center gap-1 font-medium">
                            <Download className="w-4 h-4" /> Download Report PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
