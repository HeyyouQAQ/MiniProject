import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Loader2, Calendar } from 'lucide-react';

interface PayrollRecord {
    PayPeriodStart: string;
    PayPeriodEnd: string;
    TotalHours: number;
    GrossPay: number;
    Deductions: number;
    NetPay: number;
    Status: 'Generated' | 'Paid';
}

interface PayrollProps {
    isDarkMode: boolean;
}

export function Payroll({ isDarkMode }: PayrollProps) {
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month YYYY-MM

    const fetchPayrolls = async () => {
        setIsLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            let url = `payroll.php?action=get_my_payroll&userId=${user.id}`;
            if (selectedMonth) {
                const [year, month] = selectedMonth.split('-');
                url += `&year=${year}&month=${month}`;
            }
            const response = await fetchApi(url);
            if (response.status === 'success') {
                setPayrolls(response.data);
            } else {
                setError(response.message || 'Failed to fetch payroll data.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [selectedMonth]);

    return (
        <div>

            <h2 className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payroll</h2>

            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Month:</span>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    max={new Date().toISOString().slice(0, 7)} // Prevent future months
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`block rounded-lg shadow-sm border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                        }`}
                />

            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`mb-4 font-bold ${isDarkMode ? 'text-white' : ''}`}>Monthly Salary Slip</h3>
                        <div className="space-y-3">
                            {payrolls.length === 0 ? (
                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No payrolls generated yet.</p>
                            ) : (
                                payrolls.map((payroll, idx) => (
                                    <div key={idx} className={`p-6 border rounded-xl transition-all duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:shadow-md border-gray-100'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay Period</p>
                                                <div className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {new Date(payroll.PayPeriodStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(payroll.PayPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${payroll.Status === 'Paid'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {payroll.Status}
                                            </span>
                                        </div>

                                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                            <div>
                                                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Hours</p>
                                                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{payroll.TotalHours} hrs</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gross Pay</p>
                                                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>RM {payroll.GrossPay}</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deductions</p>
                                                <p className="font-semibold text-red-500">- RM {payroll.Deductions}</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Pay</p>
                                                <p className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>RM {payroll.NetPay}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
