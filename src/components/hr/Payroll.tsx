import { useState } from 'react';
import { Download, CheckCircle, Calculator } from 'lucide-react';

interface PayrollProps {
    isDarkMode: boolean;
}

export function Payroll({ isDarkMode }: PayrollProps) {
    const [isCalculating, setIsCalculating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    const calculatePayroll = () => {
        setIsCalculating(true);
        setTimeout(() => {
            setIsCalculating(false);
            setIsGenerated(true);
        }, 2000);
    };

    const employees = [
        { name: 'John Doe', role: 'Kitchen Staff', hours: 45, overtime: 5, bonus: 50, penalty: 0, total: 850 },
        { name: 'Jane Smith', role: 'Server', hours: 40, overtime: 0, bonus: 100, penalty: 20, total: 680 },
        { name: 'Bob Johnson', role: 'Cleaner', hours: 35, overtime: 0, bonus: 0, penalty: 0, total: 525 },
        { name: 'Alice Williams', role: 'Team Leader', hours: 42, overtime: 2, bonus: 150, penalty: 0, total: 980 },
    ];

    return (
        <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payroll Generation</h2>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Period: Dec 1 - Dec 15, 2025</p>
                    </div>
                    <button
                        onClick={calculatePayroll}
                        disabled={isCalculating || isGenerated}
                        className={`
              px-6 py-3 rounded-xl font-medium text-white shadow-lg flex items-center gap-2
              transition-all transform hover:scale-105
              ${isGenerated ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              ${isCalculating ? 'bg-red-400 cursor-wait' : ''}
            `}
                    >
                        {isCalculating ? 'Calculating...' : isGenerated ? (
                            <>
                                <CheckCircle className="w-5 h-5" /> Payroll Generated
                            </>
                        ) : (
                            <>
                                <Calculator className="w-5 h-5" /> Calculate Payroll
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isGenerated && (
                <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                        <table className={`w-full text-left min-w-[800px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <thead className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'} uppercase text-xs font-semibold tracking-wider`}>
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Hours</th>
                                    <th className="p-4">Overtime</th>
                                    <th className="p-4">Bonus</th>
                                    <th className="p-4">Penalties</th>
                                    <th className="p-4 text-right">Net Salary</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'}`}>
                                {employees.map((emp, idx) => (
                                    <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <td className={`p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.name}</td>
                                        <td className="p-4">{emp.role}</td>
                                        <td className="p-4">{emp.hours}h</td>
                                        <td className="p-4 text-yellow-600">{emp.overtime}h</td>
                                        <td className="p-4 text-green-600">+RM {emp.bonus}</td>
                                        <td className="p-4 text-red-600">-RM {emp.penalty}</td>
                                        <td className={`p-4 text-right font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RM {emp.total.toFixed(2)}</td>
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
