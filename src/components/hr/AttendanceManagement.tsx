import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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

    const handleSaveChanges = async () => {
        if (!selectedRecord) return;

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
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
