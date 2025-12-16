import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Paperclip } from 'lucide-react';

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
    const [filterType, setFilterType] = useState('All');
    const [sortOrder, setSortOrder] = useState('Latest');

    const fetchHistory = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (user.id) {
                const response = await fetchApi(`leaves.php?action=my_leaves&userId=${user.id}`);
                if (response.status === 'success') {
                    setHistory(response.data);
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
        .filter(item => filterType === 'All' || item.LeaveType === filterType)
        .sort((a, b) => {
            const dateA = new Date(a.StartDate).getTime();
            const dateB = new Date(b.StartDate).getTime();
            return sortOrder === 'Latest' ? dateB - dateA : dateA - dateB;
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

            const response = await fetch('http://localhost:8000/api/leaves.php?action=apply', {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const cardClass = `rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;
    const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
        : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`;
    const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Application History
                    </h2>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {filteredHistory.length} records
                    </span>
                </div>

                <div className={`${cardClass} min-h-[400px]`}>
                    {/* Filter Bar */}
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                        <Select onValueChange={setFilterType} value={filterType}>
                            <SelectTrigger className={`h-9 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Types</SelectItem>
                                <SelectItem value="Annual">Annual</SelectItem>
                                <SelectItem value="Sick">Sick</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setFilterStatus} value={filterStatus}>
                            <SelectTrigger className={`h-9 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setSortOrder} value={sortOrder}>
                            <SelectTrigger className={`h-9 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Latest">Latest First</SelectItem>
                                <SelectItem value="Oldest">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* History List */}
                    <div className="space-y-3 overflow-y-auto max-h-[350px]">
                        {filteredHistory.length === 0 ? (
                            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No leave applications found.</p>
                            </div>
                        ) : (
                            filteredHistory.map((record, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                                {record.LeaveType}
                                            </span>
                                            <div className={`mt-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {record.StartDate} - {record.EndDate}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(record.Status)}`}>
                                            {record.Status}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {record.Reason}
                                    </p>
                                    {record.AttachmentPath && (
                                        <a
                                            href={`http://localhost:8000/${record.AttachmentPath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            <Paperclip className="w-3 h-3" />
                                            View Attachment
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

