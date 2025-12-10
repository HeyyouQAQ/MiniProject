import { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface AccountManagementProps {
  isDarkMode: boolean;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'HR' | 'Staff';
  email: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export function AccountCreation({ isDarkMode }: AccountManagementProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data
  const [users] = useState<User[]>([
    { id: '1', username: 'john.smith', fullName: 'John Smith', role: 'Staff', email: 'john.smith@wcdonald.com', createdDate: 'Dec 1, 2025', status: 'Active' },
    { id: '2', username: 'jane.doe', fullName: 'Jane Doe', role: 'HR', email: 'jane.doe@wcdonald.com', createdDate: 'Nov 15, 2025', status: 'Active' },
    { id: '3', username: 'mike.wilson', fullName: 'Mike Wilson', role: 'Staff', email: 'mike.wilson@wcdonald.com', createdDate: 'Nov 10, 2025', status: 'Active' },
    { id: '4', username: 'sarah.brown', fullName: 'Sarah Brown', role: 'Staff', email: 'sarah.brown@wcdonald.com', createdDate: 'Oct 28, 2025', status: 'Inactive' },
  ]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Management</h2>
          <p className={`text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage user accounts for HR and Staff
          </p>
        </div>
        {viewMode === 'list' && (
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Create New Account
          </button>
        )}
      </div>

      {viewMode === 'create' ? (
        <div className={`rounded-xl shadow-lg p-8 transition-colors duration-500 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New User Account</h3>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="user@wcdonald.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="username"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role <span className="text-red-500">*</span>
                </label>
                <select className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                  <option value="">Select Role</option>
                  <option value="staff">Staff</option>
                  <option value="hr">Human Resource</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                className="flex-1 sm:flex-none sm:w-48 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-red-500/30 font-semibold"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none sm:w-32 px-6 py-3 rounded-xl transition-all duration-300 font-semibold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg transition-colors duration-500 border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Accounts</h3>

              <div className="relative w-full sm:w-72">
                <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    User
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Role
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-500 ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`group transition-colors duration-300 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-red-50/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-red-100 text-red-600'}`}>
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-medium transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.fullName}
                          </div>
                          <div className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            @{user.username}
                          </div>
                          <div className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${user.role === 'HR'
                          ? isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200'
                          : isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                        {user.role === 'HR' ? 'Human Resource' : 'Staff'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.createdDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${user.status === 'Active'
                          ? isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : isDarkMode ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-currentColor' : 'bg-gray-500'}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${isDarkMode ? 'hover:bg-blue-900/50 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${isDarkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-50 text-red-600'}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
