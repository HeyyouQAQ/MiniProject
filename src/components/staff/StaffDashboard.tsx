import { useState, useEffect } from 'react';
import { Sidebar, MenuItem } from '../Sidebar';
import { Header } from '../Header';
import { Schedule } from '../Schedule';
import { StatsCards } from '../StatsCards';
import { ChatBot } from '../ChatBot';
import { Clock, Bell, MessageCircle, DollarSign, Umbrella, LayoutDashboard, Users } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { LeaveApplication } from './LeaveApplication';
import { Payroll } from './Payroll';

interface StaffDashboardProps {
    onLogout: () => void;
}

interface AttendanceStatus {
    status: 'clocked-out' | 'clocked-in';
    lastClockIn: string | null;
    lastClockOut: string | null;
    todaysHours: string;
}

const ClockInSection = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [time, setTime] = useState(new Date());
    const [attendance, setAttendance] = useState<AttendanceStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const fetchAttendance = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!user.id) {
                setError("User not found. Please log in again.");
                setIsLoading(false);
                return;
            }
            const response = await fetchApi(`attendance.php?action=status&userId=${user.id}`);
            if (response.status === 'success') {
                setAttendance(response.data);
            } else {
                setError(response.message || 'Failed to fetch attendance status.');
            }
        } catch (err: any) {
            setError(err.message || "Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        const timer = setInterval(() => setTime(new Date()), 1000);

        let cooldownTimer: NodeJS.Timeout;
        if (cooldown > 0) {
            cooldownTimer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer);
            if (cooldownTimer) clearInterval(cooldownTimer);
        };
    }, [cooldown]);

    const handleClockInOut = async (actionType: 'clock_in' | 'clock_out') => {
        setIsLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const response = await fetchApi('attendance.php?action=' + actionType, {
                method: 'POST',
                body: JSON.stringify({ userId: user.id }),
            });

            if (response.status === 'success') {
                await fetchAttendance(); // Refresh data
                // Start cooldown only after clocking in
                if (actionType === 'clock_in') {
                    setCooldown(60);
                }
            } else {
                setError(response.message || `Failed to ${actionType.replace('_', ' ')}.`);
            }
        } catch (err: any) {
            setError(err.message || "Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Clock In / Out</h2>
            <div className={`rounded-lg shadow-sm p-6 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                <div className="text-center space-y-6">
                    <div className="text-6xl">🕖</div>
                    <div className={`text-3xl md:text-4xl tabular-nums transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    {/* Single Button with color states */}
                    {(() => {
                        const isClockedIn = attendance?.status === 'clocked-in';
                        const isInCooldown = cooldown > 0;

                        let bgColor = '';
                        let hoverBg = '';
                        let buttonText = '';
                        let isDisabled = isLoading;
                        let onClick = () => { };

                        if (isLoading) {
                            bgColor = '#6b7280';
                            buttonText = 'Processing...';
                            isDisabled = true;
                        } else if (isInCooldown) {
                            bgColor = '#6b7280';
                            buttonText = `${cooldown}s`;
                            isDisabled = true;
                        } else if (!isClockedIn) {
                            bgColor = '#dc2626';
                            hoverBg = '#b91c1c';
                            buttonText = 'Clock In';
                            onClick = () => handleClockInOut('clock_in');
                        } else {
                            bgColor = '#16a34a';
                            hoverBg = '#15803d';
                            buttonText = 'Clock Out';
                            onClick = () => handleClockInOut('clock_out');
                        }

                        return (
                            <button
                                onClick={onClick}
                                disabled={isDisabled}
                                onMouseEnter={(e) => { if (hoverBg && !isDisabled) e.currentTarget.style.backgroundColor = hoverBg; }}
                                onMouseLeave={(e) => { if (hoverBg && !isDisabled) e.currentTarget.style.backgroundColor = bgColor; }}
                                style={{ backgroundColor: bgColor }}
                                className={`w-full px-8 py-4 rounded-lg transition-all duration-300 text-lg font-bold text-white border-0 outline-none shadow-lg ${isDisabled ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'}`}
                            >
                                {buttonText}
                            </button>
                        );
                    })()}
                    <div className={`pt-6 border-t space-y-3 transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : ''}`}>
                        <div className="flex justify-between">
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Clock In:</span>
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>{attendance?.lastClockIn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Clock Out:</span>
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>{attendance?.lastClockOut || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today's Hours:</span>
                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>{attendance?.todaysHours || '0h 00m'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export function StaffDashboard({ onLogout }: StaffDashboardProps) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'clock-in', label: 'Clock In/Out', icon: Clock },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'announcement', label: 'Announcement', icon: Bell },
        { id: 'chats', label: 'Chats @ Schedule', icon: MessageCircle },
        { id: 'leave', label: 'Leave', icon: Umbrella },
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
                roleLabel="Staff Portal"
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
                            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Staff Dashboard
                                        </h2>
                                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            View your schedule and everyday tasks
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Schedule isDarkMode={isDarkMode} />
                            <StatsCards isDarkMode={isDarkMode} />
                        </div>
                    )}

                    {activeSection === 'clock-in' && <ClockInSection isDarkMode={isDarkMode} />}

                    {activeSection === 'payroll' && <Payroll isDarkMode={isDarkMode} />}

                    {activeSection === 'announcement' && (
                        <div>
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Announcements</h2>
                            <div className="space-y-4">
                                {[
                                    { title: 'Holiday Schedule Updated', date: 'Dec 8, 2025', content: 'Please check your schedule for holiday shifts.' },
                                    { title: 'New Uniforms Available', date: 'Dec 5, 2025', content: 'Pick up your new uniform from the manager office.' },
                                    { title: 'Staff Meeting - Dec 15', date: 'Dec 3, 2025', content: 'Monthly staff meeting at 3 PM in the break room.' },
                                ].map((item, idx) => (
                                    <div key={idx} className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>{item.title}</h3>
                                            <span className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.date}</span>
                                        </div>
                                        <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'chats' && (
                        <div>
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Team Chats</h2>
                            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chat feature coming soon...</p>
                            </div>
                        </div>
                    )}



                    {activeSection === 'leave' && <LeaveApplication isDarkMode={isDarkMode} />}
                </main>
            </div>

            <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} isDarkMode={isDarkMode} />
        </div>
    );
}

