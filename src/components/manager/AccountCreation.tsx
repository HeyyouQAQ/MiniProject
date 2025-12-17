import { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface AccountManagementProps {
  isDarkMode: boolean;
}

export function AccountCreation({ isDarkMode }: AccountManagementProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [contactNumber, setContactNumber] = useState('');
  const [hiringDate, setHiringDate] = useState('');
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Data state
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // UI messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  // Fetch users & roles
  const fetchData = async () => {
    try {
      const usersData = await fetchApi('users.php');
      if (Array.isArray(usersData)) setUsers(usersData);

      const rolesData = await fetchApi('users.php?action=roles');
      if (Array.isArray(rolesData)) setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate username from full name
  const generateUsername = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '.');
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get role badge style
  const getRoleBadgeStyle = (role: string) => {
    const roleLower = (role === 'Worker' ? 'Staff' : role)?.toLowerCase() || '';
    if (roleLower === 'hr' || roleLower === 'human resource') {
      return {
        backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.2)' : '#fef3c7',
        color: isDarkMode ? '#fcd34d' : '#b45309',
        borderColor: isDarkMode ? '#f59e0b' : '#fcd34d',
      };
    }
    return {
      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
      color: isDarkMode ? '#93c5fd' : '#1d4ed8',
      borderColor: isDarkMode ? '#3b82f6' : '#bfdbfe',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header - Updated to match image style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Management
          </h2>
          <p className={`text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Create and manage user accounts for HR and Staff
          </p>
        </div>
        {viewMode === 'list' && (
          <button
            onClick={() => {
              setEditingUserId(null);
              setFullName(''); setEmail(''); setRoleId(''); setContactNumber('');
              setHiringDate(new Date().toISOString().split('T')[0]);
              setPassword('');
              setViewMode('create');
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Create New Account
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {viewMode === 'create' ? (
        <div className={`rounded-xl shadow-lg p-8 transition-colors duration-500 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingUserId ? 'Edit User Account' : 'Create New User Account'}
          </h3>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="user@wcdonald.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+60 123 456 789"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Hiring Date */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hiring Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={hiringDate}
                  onChange={(e) => setHiringDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.RoleID} value={r.RoleID}>{r.Type === 'Worker' ? 'Staff' : r.Type}</option>
                  ))}
                </select>
              </div>

              {/* Password - Only show when EDITING */}
              {editingUserId && (
                <div className="space-y-2">
                  <label className={`block text-sm font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reset Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep current"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();

                  if (password) {
                    const hasMinLength = password.length >= 8;
                    const hasNumber = /\d/.test(password);
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    if (!hasMinLength || !hasNumber || !hasSpecialChar) {
                      alert("Password must be at least 8 characters long and include numbers and special characters.");
                      return;
                    }
                  }

                  const userData = {
                    id: editingUserId,
                    fullName,
                    email,
                    roleId,
                    contactNumber,
                    hiringDate,
                    password: password || undefined
                  };

                  try {
                    await fetchApi('users.php', {
                      method: 'POST',
                      body: JSON.stringify(userData),
                    });
                    setSuccessMessage(editingUserId ? 'Account updated successfully' : 'Account created successfully');
                    fetchData();
                    setEditingUserId(null);
                    setViewMode('list');
                    setTimeout(() => setSuccessMessage(null), 2500);
                  } catch (err: any) {
                    alert('Error: ' + err.message);
                  }
                }}
                className="flex-1 sm:flex-none sm:w-48 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-red-500/30 font-semibold"
              >
                {editingUserId ? 'Save Changes' : 'Create Account'}
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
        /* User Accounts List - Updated styling to match image */
        <div className={`rounded-xl shadow-lg transition-colors duration-500 border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          {/* List Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Accounts
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/80'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`group transition-colors duration-300 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    {/* User Info - Updated to match image style */}
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{generateUsername(user.fullName)}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-3 py-1 text-xs font-semibold rounded-full border"
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {user.role === 'Worker' ? 'Staff' : user.role}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.contactNumber || '-'}
                    </td>

                    {/* Created Date */}
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(user.hiringDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setFullName(user.fullName);
                            setEmail(user.email);
                            setRoleId(user.roleId);
                            setContactNumber(user.contactNumber);
                            setHiringDate(user.hiringDate);
                            setPassword('');
                            setViewMode('create');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                            color: isDarkMode ? '#60a5fa' : '#6b7280',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.3)' : '#eff6ff';
                            e.currentTarget.style.color = isDarkMode ? '#93c5fd' : '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'transparent';
                            e.currentTarget.style.color = isDarkMode ? '#60a5fa' : '#6b7280';
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({ id: user.id, name: user.fullName })}
                          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                          style={{
                            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            color: isDarkMode ? '#f87171' : '#6b7280',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#fef2f2';
                            e.currentTarget.style.color = isDarkMode ? '#fca5a5' : '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'transparent';
                            e.currentTarget.style.color = isDarkMode ? '#f87171' : '#6b7280';
                          }}
                        >
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

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            {successMessage}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl transform transition-all scale-100 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Confirm Deletion
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Are you sure you want to delete <strong>{deleteConfirmation.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={async () => {
                    try {
                      await fetchApi(`users.php?id=${deleteConfirmation.id}`, { method: 'DELETE' });
                      fetchData();
                      setSuccessMessage('Account deleted successfully');
                      setTimeout(() => setSuccessMessage(null), 2000);
                    } catch (e) {
                      alert('Failed to delete');
                    } finally {
                      setDeleteConfirmation(null);
                    }
                  }}
                  className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className={`px-6 py-2.5 rounded-lg font-medium border transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
