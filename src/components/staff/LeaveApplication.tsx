import { useState, useEffect } from 'react';
import { fetchApi, API_BASE_URL } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Paperclip, Calendar, Heart, Coffee, HelpCircle } from 'lucide-react';

interface LeaveRequest {
    LeaveType: string;
    StartDate: string;
    EndDate: string;
    Reason: string;
    Status: 'Pending' | 'Approved' | 'Rejected';
    AttachmentPath?: string;
}

export function LeaveApplication({ isDarkMode }: { isDarkMode: boolean }) {
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<LeaveRequest[]>([]);

    // Filter State
    const [filterStatus, setFilterStatus] = useState('All');

    // Leave Balance State
    const [leaveBalance, setLeaveBalance] = useState<any>(null);

    const fetchHistory = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (user.id) {
                const response = await fetchApi(`leaves.php?action=my_leaves&userId=${user.id}`);
                if (response.status === 'success') {
                    setHistory(response.data);
                }
                // Also fetch leave balance
                const balanceRes = await fetchApi(`leaves.php?action=leave_balance&userId=${user.id}`);
                if (balanceRes.status === 'success') {
                    setLeaveBalance(balanceRes.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch leave history", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history
        .filter(item => filterStatus === 'All' || item.Status === filterStatus)
        .sort((a, b) => {
            const dateA = new Date(a.StartDate).getTime();
            const dateB = new Date(b.StartDate).getTime();
            return dateB - dateA; // Always latest first
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!leaveType || !startDate || !endDate || !reason) {
            setError('Please fill out all fields.');
            setIsLoading(false);
            return;
        }

        // Calculate requested days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const requestedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Validate leave balance for Annual and Sick leave
        if (leaveBalance) {
            if (leaveType === 'Annual' && leaveBalance.annual.remaining < requestedDays) {
                setError(`Insufficient annual leave balance. You have ${leaveBalance.annual.remaining} days remaining but requested ${requestedDays} days.`);
                setIsLoading(false);
                return;
            }
            if (leaveType === 'Sick' && leaveBalance.sick.remaining < requestedDays) {
                setError(`Insufficient sick leave balance. You have ${leaveBalance.sick.remaining} days remaining but requested ${requestedDays} days.`);
                setIsLoading(false);
                return;
            }
        }

        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

            // Use FormData for file upload
            const formData = new FormData();
            formData.append('userId', user.id);
            formData.append('leaveType', leaveType);
            formData.append('startDate', startDate);
            formData.append('endDate', endDate);
            formData.append('reason', reason);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await fetch(`${API_BASE_URL}/leaves.php?action=apply`, {
                method: 'POST',
                body: formData,
            }).then(res => res.json());

            if (response.status === 'success') {
                setSuccess(response.message);
                setLeaveType('');
                setStartDate('');
                setEndDate('');
                setReason('');
                setAttachment(null);
                // Reset file input
                const fileInput = document.getElementById('attachment-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchHistory();
            } else {
                setError(response.message || 'Failed to submit leave application.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const getAttachmentUrl = (path: string) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;

        // Robustly join API_BASE_URL and path
        const cleanBase = API_BASE_URL.replace(/\/api\/?$/, '');
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        return `${cleanBase}/${cleanPath}`;
    };

    const cardClass = `rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;
    const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
        : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`;
    const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="space-y-6">
            {/* Leave Balance Cards */}
            {leaveBalance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`${cardClass} !p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" style={{ color: '#dc2626' }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Annual Leave</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>
                            {leaveBalance.annual.remaining}
                            <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> / {leaveBalance.annual.total} days</span>
                        </p>
                        {leaveBalance.annual.pending > 0 && (
                            <p className="text-xs text-orange-500 mt-1">{leaveBalance.annual.pending} days pending</p>
                        )}
                    </div>
                    <div className={`${cardClass} !p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4" style={{ color: '#dc2626' }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sick Leave</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>
                            {leaveBalance.sick.remaining}
                            <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> / {leaveBalance.sick.total} days</span>
                        </p>
                        {leaveBalance.sick.pending > 0 && (
                            <p className="text-xs text-orange-500 mt-1">{leaveBalance.sick.pending} days pending</p>
                        )}
                    </div>
                    <div className={`${cardClass} !p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Coffee className="w-4 h-4" style={{ color: '#dc2626' }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Unpaid Leave</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#6b7280' }}>
                            {leaveBalance.unpaid.used}
                            <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> days used</span>
                        </p>
                    </div>
                    <div className={`${cardClass} !p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Other Leave</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: '#6b7280' }}>
                            {leaveBalance.other.used}
                            <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}> days used</span>
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Form */}
                <div>
                    <h2 className={`mb-6 text-xl font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        New Leave Application
                    </h2>
                    <div className={cardClass}>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Leave Type</label>
                                <Select onValueChange={setLeaveType} value={leaveType}>
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Annual">Annual Leave</SelectItem>
                                        <SelectItem value="Sick">Sick Leave</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Start Date</label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>End Date</label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Reason</label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide details..."
                                    className={`${inputClass} min-h-[100px] resize-none`}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Supporting Document (Optional)</label>
                                <input
                                    id="attachment-input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                    className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100 cursor-pointer`}
                                />
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Accepted: PDF, JPG, PNG, GIF (e.g., medical certificate)
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Leave History */}
                <div className="mt-16 pt-6 border-t border-gray-200 lg:mt-0 lg:pt-0 lg:border-t-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                                    Application History
                                </h2>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {filteredHistory.length} records
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

                    {/* History List */}
                    <div className="space-y-5">
                        {filteredHistory.length === 0 ? (
                            <div className={`rounded-2xl p-6 shadow-xl transition-all duration-300 text-center py-16 ${isDarkMode
                                ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50'
                                : 'bg-white/80 backdrop-blur-xl border border-white/50'}`}>
                                <div className={`p-4 rounded-full mx-auto w-fit mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <FileText className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No leave applications found
                                </p>
                            </div>
                        ) : (
                            filteredHistory.map((record, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.01]
                                        ${isDarkMode
                                            ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600'
                                            : 'bg-white/80 backdrop-blur-xl border-white/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/20'}
                                        ${record.Status !== 'Pending' ? 'opacity-60' : ''}
                                    `}
                                >
                                    {record.Status !== 'Pending' && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 pointer-events-none">
                                            <span
                                                className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide text-sm text-white pointer-events-auto"
                                                style={{ backgroundColor: record.Status === 'Approved' ? '#16a34a' : '#dc2626' }}
                                            >
                                                {record.Status}
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                    {record.LeaveType}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                <Calendar className="w-4 h-4" />
                                                {record.StartDate} — {record.EndDate}
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700/30 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                            <p className="text-sm leading-relaxed">"{record.Reason}"</p>
                                        </div>

                                        {record.AttachmentPath && (
                                            <a
                                                href={getAttachmentUrl(record.AttachmentPath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`relative z-20 flex flex-row items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-4 w-fit ${isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                            >
                                                <Paperclip className="w-4 h-4" style={{ flexShrink: 0 }} />
                                                <span>View/Download Attachment</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
