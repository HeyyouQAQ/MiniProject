import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface ScheduleManagementProps {
    isDarkMode: boolean;
}

interface Schedule {
    ScheduleID: number;
    UserID: number;
    EmployeeName: string;
    ShiftDate: string;
    StartTime: string | null;
    EndTime: string | null;
    TaskDescription: string;
    Status: string;
}

interface StaffMember {
    UserID: number;
    Name: string;
}

export function ScheduleManagement({ isDarkMode }: ScheduleManagementProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weekStart, setWeekStart] = useState('');
    const [weekEnd, setWeekEnd] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    // Form state
    const [formUserId, setFormUserId] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formStartTime, setFormStartTime] = useState('08:00');
    const [formEndTime, setFormEndTime] = useState('16:00');
    const [formTask, setFormTask] = useState('');
    const [formStatus, setFormStatus] = useState('Scheduled');

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const response = await fetchApi(`schedule.php?action=get_all_schedules&weekOffset=${weekOffset}`);
            if (response.status === 'success') {
                setSchedules(response.data || []);
                setWeekStart(response.weekStart);
                setWeekEnd(response.weekEnd);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaffList = async () => {
        try {
            const response = await fetchApi('schedule.php?action=get_staff_list');
            if (response.status === 'success') {
                setStaffList(response.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch staff list:', err);
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchStaffList();
    }, [weekOffset]);

    const handleSubmit = async () => {
        if (!formUserId || !formDate) {
            alert('Please select a staff member and date');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        try {
            const response = await fetchApi('schedule.php?action=create_schedule', {
                method: 'POST',
                body: JSON.stringify({
                    userId: formUserId,
                    shiftDate: formDate,
                    startTime: formStatus === 'Off' ? null : formStartTime,
                    endTime: formStatus === 'Off' ? null : formEndTime,
                    taskDescription: formTask,
                    status: formStatus,
                    createdBy: currentUser.id
                })
            });

            if (response.status === 'success') {
                setShowModal(false);
                resetForm();
                fetchSchedules();
            } else {
                alert(response.message || 'Failed to save schedule');
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const handleDelete = async (scheduleId: number) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const response = await fetchApi(`schedule.php?id=${scheduleId}`, { method: 'DELETE' });
            if (response.status === 'success') {
                fetchSchedules();
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormUserId('');
        setFormDate('');
        setFormStartTime('08:00');
        setFormEndTime('16:00');
        setFormTask('');
        setFormStatus('Scheduled');
        setEditingSchedule(null);
    };

    const openEditModal = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setFormUserId(schedule.UserID.toString());
        setFormDate(schedule.ShiftDate);
        setFormStartTime(schedule.StartTime || '08:00');
        setFormEndTime(schedule.EndTime || '16:00');
        setFormTask(schedule.TaskDescription || '');
        setFormStatus(schedule.Status);
        setShowModal(true);
    };

    const formatTime = (time: string | null) => {
        if (!time) return '-';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const cardClass = `rounded-lg shadow-sm p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={cardClass}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Schedule Management
                            </h2>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Assign and manage staff schedules
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Schedule
                    </button>
                </div>
            </div>

            {/* Week Navigation */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <div className="text-center">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Week of {weekStart} - {weekEnd}
                        </h3>
                        {weekOffset !== 0 && (
                            <button
                                onClick={() => setWeekOffset(0)}
                                className="text-red-600 text-sm hover:underline"
                            >
                                Go to current week
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                        <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>
            </div>

            {/* Schedule Table */}
            <div className={`${cardClass} overflow-x-auto`}>
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : schedules.length === 0 ? (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No schedules for this week</p>
                        <p className="text-sm mt-2">Click "Add Schedule" to assign shifts</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className={`${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            <tr>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Staff</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Shift</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Task</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                                <th className={`px-4 py-3 text-right text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {schedules.map((schedule) => (
                                <tr key={schedule.ScheduleID} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                                    <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {schedule.EmployeeName}
                                    </td>
                                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {formatDate(schedule.ShiftDate)}
                                    </td>
                                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {schedule.Status === 'Off' ? (
                                            <span className="text-gray-400">Off</span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(schedule.StartTime)} - {formatTime(schedule.EndTime)}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {schedule.TaskDescription || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${schedule.Status === 'Completed'
                                                ? 'bg-green-100 text-green-800'
                                                : schedule.Status === 'Off'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {schedule.Status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(schedule)}
                                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                            >
                                                <Edit2 className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.ScheduleID)}
                                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                            >
                                                <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Staff Member
                                </label>
                                <select
                                    value={formUserId}
                                    onChange={(e) => setFormUserId(e.target.value)}
                                    disabled={!!editingSchedule}
                                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                >
                                    <option value="">Select Staff</option>
                                    {staffList.map(staff => (
                                        <option key={staff.UserID} value={staff.UserID}>{staff.Name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    disabled={!!editingSchedule}
                                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Status
                                </label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Off">Off (Day Off)</option>
                                </select>
                            </div>

                            {formStatus !== 'Off' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formStartTime}
                                                onChange={(e) => setFormStartTime(e.target.value)}
                                                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formEndTime}
                                                onChange={(e) => setFormEndTime(e.target.value)}
                                                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Task Description (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formTask}
                                            onChange={(e) => setFormTask(e.target.value)}
                                            placeholder="e.g., Kitchen duty, Front counter..."
                                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200'}`}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                {editingSchedule ? 'Update' : 'Create'} Schedule
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className={`px-6 py-2 rounded-lg font-semibold border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
