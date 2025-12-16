import { useState, useEffect } from 'react';
import { Check, X, Calendar, User, Loader2, Paperclip } from 'lucide-react';
<<<<<<< HEAD
import { fetchApi } from '../../utils/api';
=======
import { fetchApi, API_BASE_URL } from '../../utils/api';
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

interface LeaveRequest {
    LeaveID: number;
    Name: string;
    LeaveType: string;
    StartDate: string;
    EndDate: string;
    Reason: string;
    Status: 'Pending' | 'Approved' | 'Rejected';
    AttachmentPath?: string;
}

interface LeaveProcessingProps {
    isDarkMode: boolean;
}

export function LeaveProcessing({ isDarkMode }: LeaveProcessingProps) {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

    const fetchLeaveRequests = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetchApi('leaves.php?action=list_pending');
            if (response.status === 'success') {
                setRequests(response.data);
            } else {
                setError(response.message || 'Failed to fetch leave requests.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleAction = async (id: number, status: 'Approved' | 'Rejected') => {
        const originalRequests = [...requests];
        // Optimistically update UI
        setRequests(requests.map(req => req.LeaveID === id ? { ...req, Status: status } : req));

        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const response = await fetchApi('leaves.php?action=update_status', {
                method: 'POST',
                body: JSON.stringify({
                    leaveId: id,
                    status: status,
                    reviewedBy: user.id
                }),
            });

            if (response.status !== 'success') {
                setError(response.message || 'Failed to update status.');
                setRequests(originalRequests); // Revert on failure
            }
            // On success, UI is already updated
        } catch (err: any) {
            setError(err.message || 'Connection error.');
            setRequests(originalRequests); // Revert on failure
        }
    };

    const cardClass = `rounded-2xl p-6 shadow-xl transition-all duration-300 ${isDarkMode
        ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50'
        : 'bg-white/80 backdrop-blur-xl border border-white/50'}`;

<<<<<<< HEAD
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30';
            case 'Rejected': return 'bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30';
            default: return 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30';
        }
=======


    const getAttachmentUrl = (path: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;

        // Robustly join API_BASE_URL and path
        // API_BASE_URL usually ends with .../public/api
        // Path usually starts with api/uploads/...
        // We want .../public/api/uploads/...

        const cleanBase = API_BASE_URL.replace(/\/api\/?$/, ''); // Strip trailing /api
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        return `${cleanBase}/${cleanPath}`;
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                            Leave Applications
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {requests.length} total • {requests.filter(r => r.Status === 'Pending').length} pending
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={`flex gap-2 mb-6 p-1 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${filterStatus === status
                            ? isDarkMode
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'bg-white text-indigo-600 shadow-md'
                            : isDarkMode
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                {isLoading ? (
                    <div className={`${cardClass} flex justify-center items-center py-16`}>
                        <Loader2 className={`w-10 h-10 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                ) : requests.filter(r => filterStatus === 'All' || r.Status === filterStatus).length === 0 ? (
                    <div className={`${cardClass} text-center py-16`}>
                        <div className={`p-4 rounded-full mx-auto w-fit mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} leave requests
                        </p>
                    </div>
                ) : (
                    requests.filter(r => filterStatus === 'All' || r.Status === filterStatus).map((req) => (
                        <div
                            key={req.LeaveID}
                            className={`
                                group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.01]
                                ${isDarkMode
                                    ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600'
                                    : 'bg-white/80 backdrop-blur-xl border-white/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/20'}
                                ${req.Status !== 'Pending' ? 'opacity-60' : ''}
                            `}
                        >
                            {req.Status !== 'Pending' && (
<<<<<<< HEAD
                                <div className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] ${req.Status === 'Approved' ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                                    <span className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg ${getStatusBadge(req.Status)}`}>
=======
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 pointer-events-none">
                                    <span
                                        className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide text-sm text-white pointer-events-auto"
                                        style={{ backgroundColor: req.Status === 'Approved' ? '#16a34a' : '#dc2626' }}
                                    >
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                        {req.Status}
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{req.Name}</h3>
<<<<<<< HEAD
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-indigo-600'}`}>
=======
                                            <span className={`text-xs font-bold px-3 py-1 mt-1 inline-block rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                                {req.LeaveType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                        <Calendar className="w-4 h-4" />
                                        {req.StartDate} — {req.EndDate}
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700/30 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                    <p className="text-sm leading-relaxed">"{req.Reason}"</p>
                                </div>

                                {req.AttachmentPath && (
                                    <a
<<<<<<< HEAD
                                        href={`http://localhost:8000/${req.AttachmentPath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-4 ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        View/Download Attachment
=======
                                        href={getAttachmentUrl(req.AttachmentPath)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`relative z-20 flex flex-row items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-4 w-fit ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <Paperclip className="w-4 h-4" style={{ flexShrink: 0 }} />
                                        <span>View/Download Attachment</span>
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                    </a>
                                )}

                                {req.Status === 'Pending' && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction(req.LeaveID, 'Approved')}
<<<<<<< HEAD
                                            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white"
=======
                                            className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-semibold hover:opacity-90 active:scale-[0.98] text-white"
                                            style={{ backgroundColor: '#16a34a' }}
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                        >
                                            <Check className="w-5 h-5" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.LeaveID, 'Rejected')}
<<<<<<< HEAD
                                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold border-2 hover:scale-[1.02] active:scale-[0.98] ${isDarkMode
                                                ? 'border-gray-600 hover:bg-gray-700/50 text-gray-300'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300'}`}
=======
                                            className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-semibold hover:opacity-90 active:scale-[0.98] bg-red-600 hover:bg-red-700 text-white"
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                        >
                                            <X className="w-5 h-5" /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
