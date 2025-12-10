import { Users, Settings, UserCheck, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface ManagerOverviewProps {
    isDarkMode: boolean;
    onNavigate?: (section: string) => void;
}

export function ManagerOverview({ isDarkMode, onNavigate }: ManagerOverviewProps) {
    const stats = [
        {
            title: 'Total Users',
            value: '48',
            change: '+3 this month',
            icon: Users,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            darkColor: 'bg-blue-900 bg-opacity-30',
        },
        {
            title: 'Staff Members',
            value: '42',
            change: '87.5% of total',
            icon: UserCheck,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            darkColor: 'bg-green-900 bg-opacity-30',
        },
        {
            title: 'HR Personnel',
            value: '6',
            change: '12.5% of total',
            icon: Users,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
            darkColor: 'bg-purple-900 bg-opacity-30',
        },
        {
            title: 'Base Hourly Rate',
            value: 'RM 15.00',
            change: 'System default',
            icon: DollarSign,
            color: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            darkColor: 'bg-yellow-900 bg-opacity-30',
        },
    ];

    const recentActivities = [
        { action: 'Created new staff account', user: 'mike.wilson', time: '2 hours ago', type: 'create' },
        { action: 'Updated overtime rate', user: 'System Config', time: '5 hours ago', type: 'update' },
        { action: 'Created HR account', user: 'jane.doe', time: '1 day ago', type: 'create' },
        { action: 'Updated base salary', user: 'System Config', time: '2 days ago', type: 'update' },
        { action: 'Deactivated staff account', user: 'sarah.brown', time: '3 days ago', type: 'delete' },
    ];

    const systemConfig = [
        { label: 'Overtime Rate', value: '1.5x', icon: TrendingUp },
        { label: 'Holiday Rate', value: '2.0x', icon: TrendingUp },
        { label: 'Working Hours/Day', value: '8 hours', icon: Clock },
        { label: 'Late Penalty', value: 'RM 5.00', icon: DollarSign },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Manager Dashboard</h2>
                <p className={`text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overview of system accounts and configuration
                </p>
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

                {/* System Configuration Summary */}
                <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Current System Configuration</h3>

                    <div className="space-y-4">
                        {systemConfig.map((config, idx) => {
                            const Icon = config.icon;

                            return (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Icon className="w-4 h-4 text-red-600" />
                                        </div>
                                        <span className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {config.value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full mt-4 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors">
                        Modify Configuration
                    </button>
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
