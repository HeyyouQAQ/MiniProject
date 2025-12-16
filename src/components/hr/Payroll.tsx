import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Download, CheckCircle, Calculator, Loader2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
=======
import { DollarSign, Users, Clock, Loader2, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../utils/api';
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

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
<<<<<<< HEAD
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
=======
    const [success, setSuccess] = useState('');
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

    const fetchPayrolls = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetchApi('payroll.php?action=get_all_payrolls');
            if (response.status === 'success') {
<<<<<<< HEAD
                setPayrolls(response.data);
            } else {
                setError(response.message || 'Failed to fetch payrolls.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
=======
                setPayrolls(response.data || []);
            }
        } catch (err: any) {
            console.error('Failed to fetch payrolls:', err);
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
<<<<<<< HEAD
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
=======
        fetchPayrolls();
    }, []);

    const handleGeneratePayroll = async () => {
        setIsGenerating(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetchApi('payroll.php?action=generate_payroll', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            if (response.status === 'success') {
                setPayrolls(response.data || []);
                setSuccess('Payroll generated successfully!');
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
            } else {
                setError(response.message || 'Failed to generate payroll.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsGenerating(false);
        }
    };
<<<<<<< HEAD

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
=======

    // Calculate totals safely
    const totalGross = payrolls.reduce((sum, emp) => sum + (emp.GrossPay || 0), 0);
    const totalDeductions = payrolls.reduce((sum, emp) => sum + (emp.Deductions || 0), 0);
    const totalNet = payrolls.reduce((sum, emp) => sum + (emp.NetPay || 0), 0);
    const totalHours = payrolls.reduce((sum, emp) => sum + (emp.TotalHours || 0), 0);

    const cardClass = `rounded-lg p-6 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Payroll Generation
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Generate and view employee payroll data
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleGeneratePayroll}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#dc2626' }}
                >
                    {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-5 h-5" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Payroll'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={cardClass}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employees</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{payrolls.length}</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                            <Clock className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Hours</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalHours.toFixed(1)}h</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                            <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gross Pay</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {totalGross.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#fef2f2' }}>
                            <DollarSign className="w-5 h-5" style={{ color: '#dc2626' }} />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Pay</p>
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {totalNet.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Payroll Table */}
            <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Employee Payroll Details
                </h3>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No payroll data available</p>
                        <p className="text-sm mt-1">Click "Generate Payroll" to create payroll records</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employee</th>
                                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hours</th>
                                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gross Pay</th>
                                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deductions</th>
                                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Pay</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                                {payrolls.map((emp, idx) => (
                                    <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                                        <td className={`py-4 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.Name}</td>
                                        <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                {emp.RoleName}
                                            </span>
                                        </td>
                                        <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{(emp.TotalHours || 0).toFixed(2)}h</td>
                                        <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>RM {(emp.GrossPay || 0).toFixed(2)}</td>
                                        <td className="py-4 px-4 text-red-600">-RM {(emp.Deductions || 0).toFixed(2)}</td>
                                        <td className={`py-4 px-4 text-right font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {(emp.NetPay || 0).toFixed(2)}</td>
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                    </tr>
                                ))}
                            </tbody>
                            {payrolls.length > 0 && (
                                <tfoot>
                                    <tr className={`border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                        <td colSpan={3} className={`py-4 px-4 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</td>
                                        <td className={`py-4 px-4 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {totalGross.toFixed(2)}</td>
                                        <td className="py-4 px-4 font-bold text-red-600">-RM {totalDeductions.toFixed(2)}</td>
                                        <td className={`py-4 px-4 text-right font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {totalNet.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
