import { useState } from 'react';
import { Check, X, Calendar, User } from 'lucide-react';

interface LeaveProcessingProps {
    isDarkMode: boolean;
}

export function LeaveProcessing({ isDarkMode }: LeaveProcessingProps) {
    const [requests, setRequests] = useState([
        { id: 1, name: 'Michael Chen', type: 'Sick Leave', dates: 'Dec 10 - Dec 11', reason: 'Flu symptoms', status: 'pending' },
        { id: 2, name: 'Sarah Wilson', type: 'Annual Leave', dates: 'Dec 24 - Dec 26', reason: 'Family Christmas trip', status: 'pending' },
        { id: 3, name: 'David Lee', type: 'Personal', dates: 'Dec 15', reason: 'Dentist appointment', status: 'pending' },
    ]);

    const handleAction = (id: number, action: 'approved' | 'rejected') => {
        setRequests(requests.map(req => req.id === id ? { ...req, status: action } : req));
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Leave Applications</h2>

            <div className="space-y-4">
                {requests.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending leave requests.</p>
                )}

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className={`
              relative overflow-hidden rounded-xl border transition-all duration-300
              ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
              ${req.status !== 'pending' ? 'opacity-50' : 'shadow-md hover:shadow-lg'}
            `}
                    >
                        {req.status !== 'pending' && (
                            <div className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px] ${req.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <span className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {req.status}
                                </span>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{req.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{req.type}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Calendar className="w-4 h-4" />
                                    {req.dates}
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <p className="text-sm italic">&quot;{req.reason}&quot;</p>
                            </div>

                            {req.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, 'approved')}
                                        className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                                        style={{
                                            background: isDarkMode
                                                ? 'linear-gradient(to right, #16a34a, #15803d)'
                                                : 'linear-gradient(to right, #22c55e, #16a34a)',
                                            color: '#ffffffff'
                                        }}
                                    >
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'rejected')}
                                        className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
