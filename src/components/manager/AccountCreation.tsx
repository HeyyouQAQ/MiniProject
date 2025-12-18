import { useState, useEffect, Fragment } from 'react';
import { UserPlus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface AccountManagementProps {
  isDarkMode: boolean;
}

export function AccountCreation({ isDarkMode }: AccountManagementProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state - Basic Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [icNumber, setIcNumber] = useState('');
  const [isIcValid, setIsIcValid] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isDobValid, setIsDobValid] = useState(true);
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isContactValid, setIsContactValid] = useState(true);
  const [address, setAddress] = useState('');

  // Form state - Employment Info
  const [roleId, setRoleId] = useState<string>('');
  const [position, setPosition] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [hiringDate, setHiringDate] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('Active');

  // Form state - Bank Info
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [epfNumber, setEpfNumber] = useState('');
  const [socsoNumber, setSocsoNumber] = useState('');
  const [eisNumber, setEisNumber] = useState('');

  // Form state - Certifications
  const [foodHandlerCertExpiry, setFoodHandlerCertExpiry] = useState('');
  const [typhoidExpiry, setTyphoidExpiry] = useState('');

  // Form state - Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [isEmergencyContactValid, setIsEmergencyContactValid] = useState(true);

  // Form state - Password
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Data state
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // UI messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

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
      {/* Header Card - Matching HR Dashboard style */}
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#dc2626' }}>
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Account Management
              </h2>
              <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create and manage user accounts for HR and Staff
              </p>
            </div>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setEditingUserId(null);
                // Reset all form fields
                setFullName(''); setEmail(''); setIcNumber(''); setDateOfBirth('');
                setGender(''); setContactNumber(''); setAddress('');
                setRoleId(''); setPosition(''); setEmploymentType('Full-Time');
                setHiringDate(new Date().toISOString().split('T')[0]);
                setEmploymentStatus('Active');
                setBankName(''); setBankAccountNumber('');
                setEpfNumber(''); setSocsoNumber(''); setEisNumber('');
                setFoodHandlerCertExpiry(''); setTyphoidExpiry('');
                setEmergencyContactName(''); setEmergencyContactNumber('');
                setPassword('');
                setViewMode('create');
              }}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold"
            >
              <UserPlus className="w-5 h-5" />
              Create New Account
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {viewMode === 'create' ? (
        <div className={`rounded-lg shadow-lg p-8 transition-colors duration-500 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingUserId ? 'Edit User Account' : 'Create New User Account'}
          </h3>

          <form className="space-y-6">
            {/* Two-Column Layout for Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full items-start">
              {/* Left Column: Personal & Employment Info */}
              <div className="space-y-6">
                {/* Section: Personal Information */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* IC Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        IC Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="900101-01-1234"
                        value={icNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIcNumber(val);
                          // Enforces strict 6-2-4 dashed format
                          setIsIcValid(val === '' || /^\d{6}-\d{2}-\d{4}$/.test(val));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${!isIcValid
                          ? 'border-2 border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      />
                      {!isIcValid && <p className="text-red-500 text-xs mt-1 animate-pulse">Invalid IC Number format (e.g. 900101-01-1234)</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="user@wcdonald.com"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmail(val);
                          setIsEmailValid(val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${!isEmailValid
                          ? 'border-2 border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      />
                      {!isEmailValid && <p className="text-red-500 text-xs mt-1 animate-pulse">Invalid email address format</p>}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDateOfBirth(val);
                          if (val) {
                            const birthDate = new Date(val);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                              age--;
                            }
                            setIsDobValid(age >= 13);
                          } else {
                            setIsDobValid(true);
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${!isDobValid
                          ? 'border-2 border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      />
                      {!isDobValid && <p className="text-red-500 text-xs mt-1 animate-pulse">Must be at least 13 years old</p>}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="012-3456789"
                        value={contactNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContactNumber(val);
                          // Malaysia: 01x-xxxxxxx or 03-xxxxxxxx
                          setIsContactValid(val === '' || /^0\d{1,2}-?\d{7,8}$/.test(val));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${!isContactValid
                          ? 'border-2 border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      />
                      {!isContactValid && <p className="text-red-500 text-xs mt-1 animate-pulse">Invalid Malaysia phone format (e.g. 012-3456789)</p>}
                    </div>

                    {/* Address - Full Width */}
                    <div className="space-y-1 md:col-span-2">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address
                      </label>
                      <textarea
                        placeholder="Enter full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Employment Information */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Select Role</option>
                        {roles.map(r => (
                          <option key={r.RoleID} value={r.RoleID}>{r.Type === 'Worker' ? 'Staff' : r.Type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Position */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Position <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Crew Member, Supervisor"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Employment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>

                    {/* Hiring Date */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hiring Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={hiringDate}
                        onChange={(e) => setHiringDate(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* Employment Status */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Resigned">Resigned</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              {/* Right Column: Bank, Certifications, Emergency Contact */}
              <div className="space-y-6">
                {/* Section: Bank & Statutory Information */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bank & Statutory Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Name */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maybank, CIMB"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* Bank Account Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* EPF Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        EPF Number
                      </label>
                      <input
                        type="text"
                        placeholder="EPF Number"
                        value={epfNumber}
                        onChange={(e) => setEpfNumber(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* SOCSO Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        SOCSO Number
                      </label>
                      <input
                        type="text"
                        placeholder="SOCSO Number"
                        value={socsoNumber}
                        onChange={(e) => setSocsoNumber(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* EIS Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        EIS Number
                      </label>
                      <input
                        type="text"
                        placeholder="EIS Number"
                        value={eisNumber}
                        onChange={(e) => setEisNumber(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Certifications */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Certifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Food Handler Cert Expiry */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Food Handler Certificate Expiry
                      </label>
                      <input
                        type="date"
                        value={foodHandlerCertExpiry}
                        onChange={(e) => setFoodHandlerCertExpiry(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* Typhoid Expiry */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Typhoid Vaccination Expiry
                      </label>
                      <input
                        type="date"
                        value={typhoidExpiry}
                        onChange={(e) => setTyphoidExpiry(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Emergency Contact */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h4 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emergency Contact Name */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="Emergency contact name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                      />
                    </div>

                    {/* Emergency Contact Number */}
                    <div className="space-y-1">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        placeholder="012-3456789"
                        value={emergencyContactNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmergencyContactNumber(val);
                          // Malaysia: 01x-xxxxxxx or 03-xxxxxxxx
                          setIsEmergencyContactValid(val === '' || /^0\d{1,2}-?\d{7,8}$/.test(val));
                        }}
                        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${!isEmergencyContactValid
                          ? 'border-2 border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500'
                          : isDarkMode
                            ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      />
                      {!isEmergencyContactValid && <p className="text-red-500 text-xs mt-1 animate-pulse">Invalid Malaysia phone format (e.g. 012-3456789)</p>}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();

                  // Input Validation
                  const icRegex = /^\d{6}-\d{2}-\d{4}$/;
                  if (icNumber && !icRegex.test(icNumber)) {
                    alert("Invalid IC Number format. Please use dashed format: 900101-01-1234");
                    return;
                  }

                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    alert("Invalid Email Address format.");
                    return;
                  }

                  // Malaysian Phone Number Validation (Mobile & Landline)
                  // Supports: 012-3456789, 0123456789, +60123456789
                  const phoneRegex = /^(\+?6?0)[0-9]{1,2}-?[0-9]{7,8}$/;
                  if (contactNumber && !phoneRegex.test(contactNumber)) {
                    alert("Invalid Contact Number. Please use a valid format (e.g., 012-3456789 or +60123456789)");
                    return;
                  }

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
                    icNumber,
                    dateOfBirth,
                    gender,
                    contactNumber,
                    address,
                    roleId,
                    position,
                    employmentType,
                    hiringDate,
                    employmentStatus,
                    bankName,
                    bankAccountNumber,
                    epfNumber: epfNumber || undefined,
                    socsoNumber: socsoNumber || undefined,
                    eisNumber: eisNumber || undefined,
                    foodHandlerCertExpiry: foodHandlerCertExpiry || undefined,
                    typhoidExpiry: typhoidExpiry || undefined,
                    emergencyContactName: emergencyContactName || undefined,
                    emergencyContactNumber: emergencyContactNumber || undefined,
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
                className="flex-1 sm:flex-none sm:w-48 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-red-500/30 font-semibold"
              >
                {editingUserId ? 'Save Changes' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none sm:w-32 px-6 py-3 rounded-lg transition-all duration-300 font-semibold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* User Accounts List - Updated styling to match image */
        <div className={`rounded-lg shadow-lg transition-colors duration-500 border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          {/* List Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Accounts
              </h3>
              {/* Pagination Controls - Top Right */}
              {totalPages > 1 && (
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {startIndex + 1} - {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${currentPage === 1
                        ? `cursor-not-allowed ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                        }`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }}
                        className={`w-12 text-center px-1 py-1 rounded border text-sm font-medium ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ {totalPages}</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                        ? `cursor-not-allowed ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                        }`}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
              <div className="relative w-full sm:w-72">
                <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
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
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {paginatedUsers.map((user) => (
                  <Fragment key={user.id}>
                    <tr
                      onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                      className={`group transition-all duration-300 cursor-pointer ${isDarkMode
                        ? `hover:bg-gray-700/50 ${expandedUserId === user.id ? 'bg-gray-700/30' : ''}`
                        : `hover:bg-gray-50 ${expandedUserId === user.id ? 'bg-blue-50/50' : ''}`
                        }`}
                    >
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

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${user.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                            user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' :
                              user.status === 'Resigned' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                                'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' // Terminated
                          }`}>
                          {user.status || 'Active'}
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
                            onClick={(e) => {
                              e.stopPropagation();

                              // Validation Logic Helpers
                              const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
                              const icCheck = user.icNumber ? /^\d{6}-\d{2}-\d{4}$/.test(user.icNumber) : true;
                              let dobCheck = true;
                              if (user.dateOfBirth) {
                                const birthDate = new Date(user.dateOfBirth);
                                const today = new Date();
                                let age = today.getFullYear() - birthDate.getFullYear();
                                const m = today.getMonth() - birthDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                  age--;
                                }
                                dobCheck = age >= 13;
                              }
                              const contactCheck = user.contactNumber ? /^0\d{1,2}-?\d{7,8}$/.test(user.contactNumber) : true;
                              const eContactCheck = user.emergencyContactNumber ? /^0\d{1,2}-?\d{7,8}$/.test(user.emergencyContactNumber) : true;

                              setEditingUserId(user.id);
                              setFullName(user.fullName);
                              setEmail(user.email);
                              setIsEmailValid(emailCheck);
                              setIcNumber(user.icNumber || '');
                              setIsIcValid(icCheck);
                              setDateOfBirth(user.dateOfBirth || '');
                              setIsDobValid(dobCheck);
                              setGender(user.gender || '');
                              setAddress(user.address || '');
                              setRoleId(user.roleId);
                              setPosition(user.position || '');
                              setEmploymentType(user.employmentType || 'Full-Time');
                              setContactNumber(user.contactNumber);
                              setIsContactValid(contactCheck);
                              setHiringDate(user.hiringDate);
                              setEmploymentStatus(user.status || 'Active');
                              setBankName(user.bankName || '');
                              setBankAccountNumber(user.bankAccountNumber || '');
                              setEpfNumber(user.epfNumber || '');
                              setSocsoNumber(user.socsoNumber || '');
                              setEisNumber(user.eisNumber || '');
                              setFoodHandlerCertExpiry(user.foodHandlerCertExpiry || '');
                              setTyphoidExpiry(user.typhoidExpiry || '');
                              setEmergencyContactName(user.emergencyContactName || '');
                              setEmergencyContactNumber(user.emergencyContactNumber || '');
                              setIsEmergencyContactValid(eContactCheck);
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
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedUserId === user.id && (
                      <tr className={`${isDarkMode ? 'bg-gray-700/80' : 'bg-gray-200'}`}>
                        <td colSpan={6} className="px-6 py-4 cursor-default">
                          <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">

                            {/* Left Column: Personal Info */}
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>IC Number</label>
                                  <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.icNumber || '-'}</p>
                                </div>
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Date of Birth</label>
                                  <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatDate(user.dateOfBirth)}</p>
                                </div>
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Gender</label>
                                  <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.gender || '-'}</p>
                                </div>
                              </div>
                              <div>
                                <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Address</label>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.address || '-'}</p>
                              </div>
                              <div>
                                <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Position</label>
                                <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.position || '-'}</p>
                              </div>
                            </div>

                            {/* Right Column: Employment & Financial */}
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Type</label>
                                  <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.employmentType || '-'}</p>
                                </div>
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Bank</label>
                                  <p className={`text-base font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.bankName || '-'} <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.bankAccountNumber}</span></p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Certifications</label>
                                  <div className="flex gap-4 mt-1">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Food Handler: <strong>{formatDate(user.foodHandlerCertExpiry)}</strong></span>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Typhoid: <strong>{formatDate(user.typhoidExpiry)}</strong></span>
                                  </div>
                                </div>
                                <div>
                                  <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Statutory</label>
                                  <div className="flex gap-4 mt-1">
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>EPF: <strong className="font-mono">{user.epfNumber || '-'}</strong></span>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>SOCSO: <strong className="font-mono">{user.socsoNumber || '-'}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className={`text-xs uppercase font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emergency Contact</label>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.emergencyContactName || '-'} <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.emergencyContactNumber}</span></p>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
