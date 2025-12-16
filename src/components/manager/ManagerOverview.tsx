import { Users, Settings, UserCheck, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';

interface ManagerOverviewProps {
    isDarkMode: boolean;
    onNavigate?: (section: string) => void;
}

export function ManagerOverview({ isDarkMode, onNavigate }: ManagerOverviewProps) {
    const [statsData, setStatsData] = useState<any>(null);
    const [activitiesData, setActivitiesData] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await fetchApi('dashboard.php');
                if (data) {
                    setStatsData(data.stats);
                    setActivitiesData(data.activities);
                }
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            }
        };
        loadDashboard();
    }, []);

    const stats = [
        {
            title: 'Total Users',
            value: statsData?.totalUsers || '0',
            change: '+3 this month', // Mock change for now or calculate if API provides
            icon: Users,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            darkColor: 'bg-blue-900 bg-opacity-30',
        },
        {
            title: 'Staff Members',
            value: statsData?.staffCount || '0',
            change: statsData ? `${((statsData.staffCount / statsData.totalUsers) * 100).toFixed(1)}% of total` : '-',
            icon: UserCheck,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            darkColor: 'bg-green-900 bg-opacity-30',
        },
        {
            title: 'HR Personnel',
            value: statsData?.hrCount || '0',
            change: statsData ? `${((statsData.hrCount / statsData.totalUsers) * 100).toFixed(1)}% of total` : '-',
            icon: Users,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
            darkColor: 'bg-purple-900 bg-opacity-30',
        },
        {
            title: 'Base Hourly Rate',
            value: statsData?.baseSalary === 'N/A' ? 'N/A' : `RM ${statsData?.baseSalary || '0.00'}`,
            change: 'See Config',
            icon: DollarSign,
            color: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            darkColor: 'bg-yellow-900 bg-opacity-30',
        },
    ];

    const recentActivities = activitiesData.length > 0 ? activitiesData : [
        // Fallback or empty state could be handled here
    ];



    return (
        <div className="space-y-6">
            <div className={`rounded-lg shadow-sm p-6 mb-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Manager Dashboard
                        </h2>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Overview of system accounts and configuration
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;

                    return (
                        <div key={idx} className={`rounded-lg shadow-sm p-6 transition-all duration-500 hover:shadow-lg transform hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? stat.darkColor : stat.color}`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>

                            <div className={`mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</div>
                            <div className={`text-3xl mb-1 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>{stat.value}</div>
                            <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.change}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Recent Activities</h3>

                    <div className="space-y-4">
                        {recentActivities.map((activity, idx) => (
                            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'create' ? 'bg-green-500' :
                                    activity.type === 'update' ? 'bg-blue-500' :
                                        'bg-red-500'
                                    }`} />
                                <div className="flex-1">
                                    <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {activity.action}
                                    </div>
                                    <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {activity.user}
                                    </div>
                                    <div className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            {/* Quick Actions */}
            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Quick Actions</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => onNavigate?.('accounts')} className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-gray-600 hover:border-red-600 hover:bg-gray-700' : 'border-gray-300 hover:border-red-600 hover:bg-red-50'}`}>
                        <Users className="w-6 h-6 text-red-600 mb-2" />
                        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Account</div>
                        <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add new user</div>
                    </button>

                    <button onClick={() => onNavigate?.('system-config')} className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-gray-600 hover:border-red-600 hover:bg-gray-700' : 'border-gray-300 hover:border-red-600 hover:bg-red-50'}`}>
                        <Settings className="w-6 h-6 text-red-600 mb-2" />
                        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Config</div>
                        <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update settings</div>
                    </button>

                    <button onClick={() => onNavigate?.('accounts')} className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-gray-600 hover:border-red-600 hover:bg-gray-700' : 'border-gray-300 hover:border-red-600 hover:bg-red-50'}`}>
                        <UserCheck className="w-6 h-6 text-red-600 mb-2" />
                        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>View Users</div>
                        <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage accounts</div>
                    </button>

                    <button onClick={() => onNavigate?.('system-config')} className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-gray-600 hover:border-red-600 hover:bg-gray-700' : 'border-gray-300 hover:border-red-600 hover:bg-red-50'}`}>
                        <DollarSign className="w-6 h-6 text-red-600 mb-2" />
                        <div className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pay Rates</div>
                        <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Adjust rates</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
