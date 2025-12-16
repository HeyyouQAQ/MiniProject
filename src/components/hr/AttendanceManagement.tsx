import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
<<<<<<< HEAD
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
=======
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Clock, Users, Pencil, Trash2, Calendar } from 'lucide-react';
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

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
<<<<<<< HEAD
=======
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd

    const fetchAttendanceRecords = async () => {
        setIsLoading(true);
        setError('');
        try {
<<<<<<< HEAD
            const response = await fetchApi('attendance.php?action=list_all');
=======
            const response = await fetchApi(`attendance.php?action=list_all&date=${selectedDate}`);
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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
<<<<<<< HEAD
    }, []);

    const handleEditClick = (record: AttendanceRecord) => {
=======
    }, [selectedDate]);

    const handleEditClick = (record: AttendanceRecord) => {
        console.log("Edit clicked for record:", record);
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        setSelectedRecord(record);
        setEditData({
            clockIn: record.ClockInTime ? new Date(record.ClockInTime).toISOString().substring(0, 16) : '',
            clockOut: record.ClockOutTime ? new Date(record.ClockOutTime).toISOString().substring(0, 16) : ''
        });
        setIsEditDialogOpen(true);
<<<<<<< HEAD
=======
        console.log("Dialog should open, isEditDialogOpen set to:", true);
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
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
    };

    const handleSaveChanges = async () => {
        if (!selectedRecord) return;

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
<<<<<<< HEAD
=======
        if (!user.id) {
            alert("User session expired or invalid. Please log out and log in again.");
            return;
        }

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        const payload = {
            attendanceId: selectedRecord.AttendanceID,
            clockIn: editData.clockIn,
            clockOut: editData.clockOut,
            overwrittenBy: user.id
        };
<<<<<<< HEAD
        
=======

>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
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

<<<<<<< HEAD
    return (
        <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Attendance Management</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
            
            <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={isDarkMode ? 'text-gray-300' : ''}>Employee</TableHead>
                            <TableHead className={isDarkMode ? 'text-gray-300' : ''}>Date</TableHead>
                            <TableHead className={isDarkMode ? 'text-gray-300' : ''}>Clock In</TableHead>
                            <TableHead className={isDarkMode ? 'text-gray-300' : ''}>Clock Out</TableHead>
                            <TableHead className={isDarkMode ? 'text-gray-300' : ''}>Status</TableHead>
                            <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.AttendanceID}>
                                    <TableCell className={isDarkMode ? 'text-gray-200' : ''}>{rec.Name}</TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-200' : ''}>{rec.WorkDate}</TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-200' : ''}>{rec.ClockInTime ? new Date(rec.ClockInTime).toLocaleTimeString() : 'N/A'}</TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-200' : ''}>{rec.ClockOutTime ? new Date(rec.ClockOutTime).toLocaleTimeString() : 'N/A'}</TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-200' : ''}>{rec.Status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleEditClick(rec)}>Edit</Button>
=======
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

            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Date:</span>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`block rounded-lg shadow-sm border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-red-500 sm:text-sm px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                        }`}
                />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            <div className={cardClass}>
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <TableHead className={`w-[20%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Employee</TableHead>
                            <TableHead className={`w-[16%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</TableHead>
                            <TableHead className={`w-[22%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clock In</TableHead>
                            <TableHead className={`w-[22%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clock Out</TableHead>
                            <TableHead className={`w-[20%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : records.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">
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

                                    <TableCell className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(rec);
                                                }}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                style={{ backgroundColor: '#2563eb', color: 'white' }}
                                            >
                                                <Pencil className="w-4 h-4" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(rec)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                style={{ backgroundColor: '#dc2626', color: 'white' }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

<<<<<<< HEAD
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
=======
            {/* Custom Modal - Styled to match website */}
            {isEditDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditDialogOpen(false)}
                    />
                    {/* Modal Content - Square compact design */}
                    <div className={`relative z-50 w-[400px] rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {/* Header with red accent */}
                        <div className="px-6 py-4 border-b" style={{ backgroundColor: '#dc2626' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white leading-none mb-1">Edit Attendance</h2>
                                    <p className="text-base text-white font-medium bg-white/10 px-2 py-0.5 rounded-md inline-block">
                                        {selectedRecord?.Name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-8">
                            <div>
                                <Label htmlFor="clock-in" className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Clock In Time
                                </Label>
                                <Input
                                    id="clock-in"
                                    type="datetime-local"
                                    value={editData.clockIn}
                                    onChange={(e) => setEditData({ ...editData, clockIn: e.target.value })}
                                    className={`w-full h-11 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200 bg-gray-50/50 focus:bg-white transition-colors'}`}
                                />
                            </div>
                            <div>
                                <Label htmlFor="clock-out" className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Clock Out Time
                                </Label>
                                <Input
                                    id="clock-out"
                                    type="datetime-local"
                                    value={editData.clockOut}
                                    onChange={(e) => setEditData({ ...editData, clockOut: e.target.value })}
                                    className={`w-full h-11 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-200 bg-gray-50/50 focus:bg-white transition-colors'}`}
                                />
                            </div>
                        </div>

                        {/* Footer with buttons */}
                        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button
                                onClick={() => setIsEditDialogOpen(false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                style={{ backgroundColor: '#dc2626' }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
>>>>>>> 11e7a106ee88f153569f250a0719c260abf8d7bd
        </div>
    );
}
