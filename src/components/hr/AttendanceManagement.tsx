import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Clock, Users, Pencil, Trash2 } from 'lucide-react';

interface AttendanceRecord {
    AttendanceID: number;
    UserID: number;
    Name: string;
    WorkDate: string;
    ClockInTime: string | null;
    ClockOutTime: string | null;
    Status: string;
}

export function AttendanceManagement({ isDarkMode }: { isDarkMode: boolean }) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [editData, setEditData] = useState({ clockIn: '', clockOut: '' });

    const fetchAttendanceRecords = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetchApi('attendance.php?action=list_all');
            if (response.status === 'success') {
                setRecords(response.data);
            } else {
                setError(response.message || 'Failed to fetch records.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const handleEditClick = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setEditData({
            clockIn: record.ClockInTime ? new Date(record.ClockInTime).toISOString().substring(0, 16) : '',
            clockOut: record.ClockOutTime ? new Date(record.ClockOutTime).toISOString().substring(0, 16) : ''
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = async (record: AttendanceRecord) => {
        if (!confirm(`Are you sure you want to delete attendance record for ${record.Name} on ${record.WorkDate}?`)) return;

        try {
            const response = await fetchApi('attendance.php?action=delete_record', {
                method: 'POST',
                body: JSON.stringify({ attendanceId: record.AttendanceID })
            });

            if (response.status === 'success') {
                fetchAttendanceRecords();
            } else {
                setError(response.message || "Failed to delete record.");
            }
        } catch (err: any) {
            setError(err.message || "Connection error.");
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedRecord) return;

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!user.id) {
            alert("User session expired or invalid. Please log out and log in again.");
            return;
        }

        const payload = {
            attendanceId: selectedRecord.AttendanceID,
            clockIn: editData.clockIn,
            clockOut: editData.clockOut,
            overwrittenBy: user.id
        };

        try {
            const response = await fetchApi('attendance.php?action=update_record', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.status === 'success') {
                setIsEditDialogOpen(false);
                fetchAttendanceRecords(); // Refresh data
            } else {
                setError(response.message || "Failed to update record.");
            }
        } catch (err: any) {
            setError(err.message || "Connection error.");
        }
    };

    const cardClass = `rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return null;
        return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                    <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Attendance Management
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        View and edit employee attendance records
                    </p>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div className={cardClass}>
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <TableHead className={`w-[18%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employee</TableHead>
                            <TableHead className={`w-[14%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</TableHead>
                            <TableHead className={`w-[16%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clock In</TableHead>
                            <TableHead className={`w-[16%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clock Out</TableHead>
                            <TableHead className={`w-[12%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</TableHead>
                            <TableHead className={`w-[14%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : records.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">
                                <Users className={`w-12 h-12 mx-auto mb-3 opacity-50 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No attendance records found</p>
                            </TableCell></TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.AttendanceID} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                                    <TableCell className={`px-4 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rec.Name}</TableCell>
                                    <TableCell className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{rec.WorkDate}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        {formatTime(rec.ClockInTime) ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                                {formatTime(rec.ClockInTime)}
                                            </span>
                                        ) : (
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        {formatTime(rec.ClockOutTime) ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                                                {formatTime(rec.ClockOutTime)}
                                            </span>
                                        ) : (
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${rec.Status === 'Present'
                                            ? 'bg-green-100 text-green-800'
                                            : rec.Status === 'Absent'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {rec.Status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEditClick(rec)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                style={{ backgroundColor: '#2563eb', color: 'white' }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(rec)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                style={{ backgroundColor: '#dc2626', color: 'white' }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className={isDarkMode ? 'bg-gray-800 text-white' : ''}>
                    <DialogHeader>
                        <DialogTitle>Edit Attendance for {selectedRecord?.Name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="clock-in">Clock In Time</Label>
                            <Input
                                id="clock-in"
                                type="datetime-local"
                                value={editData.clockIn}
                                onChange={(e) => setEditData({ ...editData, clockIn: e.target.value })}
                                className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clock-out">Clock Out Time</Label>
                            <Input
                                id="clock-out"
                                type="datetime-local"
                                value={editData.clockOut}
                                onChange={(e) => setEditData({ ...editData, clockOut: e.target.value })}
                                className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
