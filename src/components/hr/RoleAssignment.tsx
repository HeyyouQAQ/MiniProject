import { useState } from 'react';
import { UserCog, Trophy, Briefcase } from 'lucide-react';

interface RoleAssignmentProps {
    isDarkMode: boolean;
}

export function RoleAssignment({ isDarkMode }: RoleAssignmentProps) {
    const [staff, setStaff] = useState([
        { id: 1, name: 'John Doe', role: 'Staff' },
        { id: 2, name: 'Jane Smith', role: 'Staff' },
        { id: 3, name: 'Bob Johnson', role: 'Probation' },
    ]);

    const projects = ['Night Shift Leader', 'Kitchen Manager', 'Inventory Specialist'];

    const handleRoleChange = (id: number, newRole: string) => {
        setStaff(staff.map(s => s.id === id ? { ...s, role: newRole } : s));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role Management */}
            <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <UserCog className="w-6 h-6 text-red-600" />
                    Staff Role Management
                </h3>

                <div className="space-y-4">
                    {staff.map((s) => (
                        <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div>
                                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.name}</div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current: {s.role}</div>
                            </div>
                            <select
                                value={s.role}
                                onChange={(e) => handleRoleChange(s.id, e.target.value)}
                                className={`p-2 rounded-lg border outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            >
                                <option>Probation</option>
                                <option>Staff</option>
                                <option>Senior Staff</option>
                                <option>Team Leader</option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Assignments */}
            <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Special Assignments
                </h3>

                <div className="space-y-4">
                    {projects.map((project, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-gray-900' : 'bg-red-50'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{project}</h4>
                                <Briefcase className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            <select className={`w-full p-2 mt-1 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                                <option value="">Select Staff Member...</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
