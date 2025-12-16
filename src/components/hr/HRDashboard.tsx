import { useState } from 'react';
import { Sidebar, MenuItem } from '../Sidebar';
import { Header } from '../Header';
import { DollarSign, Users, BarChart2, Umbrella, Calendar, LayoutDashboard, Clock } from 'lucide-react';
import { Payroll } from './Payroll';
import { RoleAssignment } from './RoleAssignment';
import { MonthlyReport } from './MonthlyReport';
import { LeaveProcessing } from './LeaveProcessing';
import { ScheduleGen } from './ScheduleGen';
import { AttendanceManagement } from './AttendanceManagement';

interface HRDashboardProps {
    onLogout: () => void;
}

export function HRDashboard({ onLogout }: HRDashboardProps) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'payroll', label: 'Generate Payroll', icon: DollarSign },
        { id: 'roles', label: 'Role Assignment', icon: Users },
        { id: 'report', label: 'Monthly Report', icon: BarChart2 },
        { id: 'leave', label: 'Process Leave', icon: Umbrella },
        { id: 'schedule', label: 'Generate Schedule', icon: Calendar },
    ];

    return (
        <div className={`flex min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isDarkMode={isDarkMode}
                menuItems={menuItems}
                onLogout={onLogout}
                roleLabel="HR Portal"
            />

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            <div className={`p-8 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg`}>
                                <h2 className="text-3xl font-bold mb-2">HR Overview</h2>
                                <p className="opacity-90">Manage staff, payroll, and schedules efficiently.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Quick Stats */}
                                <div className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Total Employees</div>
                                    <div className="text-3xl font-bold">42</div>
                                </div>
                                <div className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Pending Leaves</div>
                                    <div className="text-3xl font-bold text-orange-500">8</div>
                                </div>
                                <div className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Payroll Status</div>
                                    <div className="text-3xl font-bold text-green-500">Ready</div>
                                </div>
                                <div className={`p-6 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                    <div className="text-gray-400 text-sm font-medium mb-1">Next Review</div>
                                    <div className="text-3xl font-bold">Dec 15</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'attendance' && <AttendanceManagement isDarkMode={isDarkMode} />}
                    {activeSection === 'payroll' && <Payroll isDarkMode={isDarkMode} />}
                    {activeSection === 'roles' && <RoleAssignment isDarkMode={isDarkMode} />}
                    {activeSection === 'report' && <MonthlyReport isDarkMode={isDarkMode} />}
                    {activeSection === 'leave' && <LeaveProcessing isDarkMode={isDarkMode} />}
                    {activeSection === 'schedule' && <ScheduleGen isDarkMode={isDarkMode} />}
                </main>
            </div>
        </div>
    );
}
