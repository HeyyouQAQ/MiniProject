import { useState, useEffect } from 'react';
import { Search, Save, DollarSign, CreditCard, Building, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface Employee {
    UserID: number;
    FullName: string;
    Email: string;
    Role: string;
    SetupID?: number;
    BasicSalary?: string;
}

interface SalarySetup {
    UserID: number;
    basic_salary: string;
    salary_per_hour: string;
    fixed_allowance: string;
    bank_name: string;
    bank_account_number: string;
    epf_account_no: string;
    tax_account_no: string;
    default_special_leave_days: string;
}

interface EmployeeFinancialProfileProps {
    userRole: 'Manager' | 'HR';
    currentUserId: number; // The ID of the logged-in user (Manager or HR)
}

export function EmployeeFinancialProfile({ userRole, currentUserId }: EmployeeFinancialProfileProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<SalarySetup>({
        UserID: 0,
        basic_salary: '0.00',
        salary_per_hour: '0.00',
        fixed_allowance: '0.00',
        bank_name: '',
        bank_account_number: '',
        epf_account_no: '',
        tax_account_no: '',
        default_special_leave_days: '0'
    });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch employee list
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                // Pass role via headers or query params as per our PHP logic
                // We'll use query params for simplicity here since fetchApi handles headers
                const data = await fetchApi(`users.php?action=salary_setup&requester_role=${userRole}`);
                console.log("Fetched employees:", data);
                if (data.status === 'success') {
                    setEmployees(data.data || []);
                }
            } catch (error) {
                console.error("Failed to load employees", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadEmployees();
    }, [userRole]);

    // Fetch specific details when an employee is selected
    useEffect(() => {
        if (!selectedEmployee) return;

        const loadDetails = async () => {
            try {
                const data = await fetchApi(`users.php?action=salary_setup&requester_role=${userRole}&user_id=${selectedEmployee.UserID}`);
                if (data.status === 'success' && data.data) {
                    const d = data.data;
                    setFormData({
                        UserID: d.UserID,
                        basic_salary: d.BasicSalary || '0.00',
                        salary_per_hour: d.SalaryPerHour || '0.00',
                        fixed_allowance: d.FixedAllowance || '0.00',
                        bank_name: d.BankName || '',
                        bank_account_number: d.BankAccountNumber || '',
                        epf_account_no: d.EPF_Account_No || '',
                        tax_account_no: d.Tax_Account_No || '',
                        default_special_leave_days: d.DefaultSpecialLeaveDays || '0'
                    });
                }
            } catch (error) {
                console.error("Failed to load details", error);
            }
        };
        loadDetails();
    }, [selectedEmployee, userRole]);

    const handleInputChange = (field: keyof SalarySetup, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!selectedEmployee) return;
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                user_id: selectedEmployee.UserID // Ensure user_id is sent
            };

            // We need to pass requester info. 
            // In a real app, this is session based. Here we simulate via query param or body if API supported it.
            // Our PHP API checks $_GET['requester_role'] for GET, but for POST it might need it in URL too or body.
            // Let's append to URL for the POST request to be safe/consistent with our simple PHP logic
            const result = await fetchApi(`users.php?action=salary_setup&requester_role=${userRole}&requester_id=${currentUserId}`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (result.status === 'success') {
                alert('Financial profile updated successfully!');
                // Refresh list to update any summary info if we had it
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error: any) {
            alert('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredEmployees = employees.filter(e =>
        (e.FullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.Email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex h-full gap-6 p-6">
            {/* Left Panel: Employee List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold text-gray-800">Employees</h2>
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1 text-sm">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-gray-500 font-medium px-1 min-w-[3rem] text-center text-xs">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No employees found.
                        </div>
                    ) : (
                        paginatedEmployees.map(emp => (
                            <button
                                key={emp.UserID}
                                onClick={() => setSelectedEmployee(emp)}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group
                  ${selectedEmployee?.UserID === emp.UserID
                                        ? 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                        : 'hover:bg-gray-50 text-gray-600 border border-transparent'
                                    }`}
                            >
                                <div>
                                    <div className="font-medium">{emp.FullName}</div>
                                    <div className="text-xs opacity-70">{emp.Role} • {emp.Email}</div>
                                </div>
                                {selectedEmployee?.UserID === emp.UserID && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Edit Form */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                {!selectedEmployee ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <User className="w-12 h-12 mb-2 opacity-20" />
                        <p>Select an employee to manage their financial profile</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{selectedEmployee.FullName}</h2>
                                <p className="text-sm text-gray-500">Financial & Payroll Setup</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-red-700"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Salary Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <h3 className="font-semibold text-gray-700">Salary Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Basic Salary (Monthly)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={formData.basic_salary}
                                                    onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hourly Rate (Part-Time)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={formData.salary_per_hour}
                                                    onChange={(e) => handleInputChange('salary_per_hour', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fixed Allowance</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RM</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    value={formData.fixed_allowance}
                                                    onChange={(e) => handleInputChange('fixed_allowance', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <CreditCard className="w-4 h-4 text-purple-600" />
                                        <h3 className="font-semibold text-gray-700">Banking Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bank Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Maybank"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.bank_name}
                                                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 11234567890"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.bank_account_number}
                                                onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Statutory Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <Building className="w-4 h-4 text-orange-600" />
                                        <h3 className="font-semibold text-gray-700">Statutory Details</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">EPF Account No</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.epf_account_no}
                                                onChange={(e) => handleInputChange('epf_account_no', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Account No</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.tax_account_no}
                                                onChange={(e) => handleInputChange('tax_account_no', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Settings */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <Calendar className="w-4 h-4 text-red-600" />
                                        <h3 className="font-semibold text-gray-700">Special Leave</h3>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Default Special Leave Days</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            value={formData.default_special_leave_days}
                                            onChange={(e) => handleInputChange('default_special_leave_days', e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Additional leave entitlement for this specific employee.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
