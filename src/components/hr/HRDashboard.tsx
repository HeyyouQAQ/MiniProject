import { useState, useEffect } from 'react';
import { Sidebar, MenuItem } from '../Sidebar';
import { Header } from '../Header';
import { DollarSign, Users, BarChart2, Umbrella, Calendar, LayoutDashboard, Clock, TrendingUp, UserCheck, FileText } from 'lucide-react';
import { Payroll } from './Payroll';
import { RoleAssignment } from './RoleAssignment';
import { MonthlyReport } from './MonthlyReport';
import { LeaveProcessing } from './LeaveProcessing';
import { ScheduleManagement } from './ScheduleManagement';
import { AttendanceManagement } from './AttendanceManagement';
import { fetchApi } from '../../utils/api';

interface HRDashboardProps {
    onLogout: () => void;
}

interface DashboardStats {
    totalEmployees: number;
    pendingLeaves: number;
    clockedInToday: number;
    clockedOutToday: number;
}

export function HRDashboard({ onLogout }: HRDashboardProps) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({ totalEmployees: 0, pendingLeaves: 0, clockedInToday: 0, clockedOutToday: 0 });

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'payroll', label: 'Generate Payroll', icon: DollarSign },
        { id: 'roles', label: 'Role Assignment', icon: Users },
        { id: 'report', label: 'Monthly Report', icon: BarChart2 },
        { id: 'leave', label: 'Process Leave', icon: Umbrella },
        { id: 'schedule', label: 'Schedule Management', icon: Calendar },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetchApi('dashboard.php');
                if (response && response.stats) {
                    setStats(response.stats);
                }
            } catch (err) {
                console.error('Failed to fetch HR stats:', err);
            }
        };
        fetchStats();
    }, []);

    const cardClass = `rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;

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
                            {/* Welcome Banner */}
                            <div className={cardClass}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            HR Dashboard
                                        </h2>
                                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Manage staff, payroll, and schedules efficiently.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards - First Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                            <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Employees</p>
                                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalEmployees}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                                            <Umbrella className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Leaves</p>
                                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: '#f97316' }}>{stats.pendingLeaves}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clocked In/Out - Each in own box, side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                            <UserCheck className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clocked In Today</p>
                                            <p className={`text-2xl font-bold`} style={{ color: '#16a34a' }}>{stats.clockedInToday}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={cardClass}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#fef2f2' }}>
                                            <Clock className="w-5 h-5" style={{ color: '#dc2626' }} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clocked Out Today</p>
                                            <p className={`text-2xl font-bold`} style={{ color: '#dc2626' }}>{stats.clockedOutToday}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className={cardClass}>
                                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setActiveSection('leave')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105"
                                        style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2' }}
                                    >
                                        <Umbrella className="w-6 h-6" style={{ color: '#dc2626' }} />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Process Leave</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('payroll')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105"
                                        style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2' }}
                                    >
                                        <DollarSign className="w-6 h-6" style={{ color: '#dc2626' }} />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gen Payroll</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('attendance')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105"
                                        style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2' }}
                                    >
                                        <Clock className="w-6 h-6" style={{ color: '#dc2626' }} />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Attendance</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('report')}
                                        className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-105"
                                        style={{ backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2' }}
                                    >
                                        <FileText className="w-6 h-6" style={{ color: '#dc2626' }} />
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'attendance' && <AttendanceManagement isDarkMode={isDarkMode} />}
                    {activeSection === 'payroll' && <Payroll isDarkMode={isDarkMode} />}
                    {activeSection === 'roles' && <RoleAssignment isDarkMode={isDarkMode} />}
                    {activeSection === 'report' && <MonthlyReport isDarkMode={isDarkMode} />}
                    {activeSection === 'leave' && <LeaveProcessing isDarkMode={isDarkMode} />}
                    {activeSection === 'schedule' && <ScheduleManagement isDarkMode={isDarkMode} />}
                </main>
            </div>
        </div>
    );
}
