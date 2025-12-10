import { useState } from 'react';
import { Sidebar, MenuItem } from '../Sidebar';
import { Header } from '../Header';
import { Schedule } from '../Schedule';
import { StatsCards } from '../StatsCards';
import { ChatBot } from '../ChatBot';
import { Clock, Bell, MessageCircle, DollarSign, StickyNote, Umbrella, LayoutDashboard } from 'lucide-react';

interface StaffDashboardProps {
    onLogout: () => void;
}

export function StaffDashboard({ onLogout }: StaffDashboardProps) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'clock-in', label: 'Clock In', icon: Clock },
        { id: 'announcement', label: 'Announcement', icon: Bell },
        { id: 'chats', label: 'Chats @ Schedule', icon: MessageCircle },
        { id: 'salary', label: 'Salary', icon: DollarSign },
        { id: 'notes', label: 'Notes', icon: StickyNote },
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
                            <Schedule isDarkMode={isDarkMode} />
                            <StatsCards isDarkMode={isDarkMode} />
                        </div>
                    )}

                    {activeSection === 'clock-in' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Clock In / Out</h2>
                            <div className={`rounded-lg shadow-sm p-6 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="text-center space-y-6">
                                    <div className="text-6xl">🕐</div>
                                    <div className={`text-3xl md:text-4xl tabular-nums transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <button className="w-full bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg">
                                        Clock In Now
                                    </button>
                                    <div className={`pt-6 border-t space-y-3 transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : ''}`}>
                                        <div className="flex justify-between">
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Clock In:</span>
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>08:00 AM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Clock Out:</span>
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>05:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today&apos;s Hours:</span>
                                            <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-200' : ''}`}>0h 00m</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {activeSection === 'salary' && (
                        <div>
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Payroll</h2>
                            <div className="space-y-6">
                                <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Current Pay Period</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Regular Hours</div>
                                            <div className={`text-2xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>38.5</div>
                                        </div>
                                        <div className={`p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overtime Hours</div>
                                            <div className={`text-2xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>2.5</div>
                                        </div>
                                        <div className={`p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'}`}>
                                            <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Pay</div>
                                            <div className="text-2xl text-red-600">RM 892.50</div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Recent Pay Stubs</h3>
                                    <div className="space-y-3">
                                        {[
                                            { period: 'Nov 16 - Nov 30, 2025', hours: '42.0', amount: 'RM 945.00' },
                                            { period: 'Nov 1 - Nov 15, 2025', hours: '40.0', amount: 'RM 880.00' },
                                            { period: 'Oct 16 - Oct 31, 2025', hours: '38.5', amount: 'RM 847.00' },
                                        ].map((stub, idx) => (
                                            <div key={idx} className={`flex justify-between items-center p-4 border rounded-lg transition-colors duration-500 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                <div>
                                                    <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>{stub.period}</div>
                                                    <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stub.hours} hours</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>{stub.amount}</div>
                                                    <button className="text-sm text-red-600 hover:underline">View Details</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notes' && (
                        <div>
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Notes</h2>
                            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <textarea
                                    className={`w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                                    placeholder="Write your notes here..."
                                    defaultValue="Remember to check inventory before opening shift..."
                                />
                                <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'leave' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className={`mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Leave Application</h2>
                            <div className={`rounded-lg shadow-sm p-4 md:p-6 mb-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <form className="space-y-4">
                                    <div>
                                        <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leave Type</label>
                                        <select className={`w-full p-3 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                                            <option>Sick Leave</option>
                                            <option>Vacation</option>
                                            <option>Personal Leave</option>
                                            <option>Emergency Leave</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                                            <input type="date" className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                                        </div>
                                        <div>
                                            <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                                            <input type="date" className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reason</label>
                                        <textarea
                                            className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                                            rows={4}
                                            placeholder="Please provide a brief reason for your leave request..."
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg">
                                        Submit Leave Request
                                    </button>
                                </form>
                            </div>

                            <div className={`rounded-lg shadow-sm p-4 md:p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Leave Balance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sick Leave</div>
                                        <div className={`text-2xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>5 days</div>
                                    </div>
                                    <div className={`p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vacation</div>
                                        <div className={`text-2xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>12 days</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} isDarkMode={isDarkMode} />
        </div>
    );
}
