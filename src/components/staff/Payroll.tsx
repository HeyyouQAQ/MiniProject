import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Loader2 } from 'lucide-react';

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

    const fetchPayrolls = async () => {
        setIsLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const response = await fetchApi(`payroll.php?action=get_my_payroll&userId=${user.id}`);
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
    }, []);

    return (
        <div>
            <h2 className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payroll</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`mb-4 font-bold ${isDarkMode ? 'text-white' : ''}`}>Recent Pay Stubs</h3>
                        <div className="space-y-3">
                            {payrolls.length === 0 ? (
                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No payrolls generated yet.</p>
                            ) : (
                                payrolls.map((payroll, idx) => (
                                    <div key={idx} className={`flex justify-between items-center p-4 border rounded-lg transition-colors duration-500 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <div>
                                            <div className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>{payroll.PayPeriodStart} - {payroll.PayPeriodEnd}</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{payroll.TotalHours} hours</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>RM {payroll.NetPay}</div>
                                            <div className={`text-sm ${payroll.Status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{payroll.Status}</div>
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
