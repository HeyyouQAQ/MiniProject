import { useState } from 'react';
import { Save, RotateCcw, DollarSign, Clock, Calendar, AlertTriangle } from 'lucide-react';

interface SystemConfigProps {
  isDarkMode: boolean;
}

export function SystemConfig({ isDarkMode }: SystemConfigProps) {
  const [config, setConfig] = useState({
    overtimeRate: '1.5',
    holidayRate: '2.0',
    baseSalary: '15.00',
    latePenalty: '5.00',
    absentPenalty: '50.00',
    workingHoursPerDay: '8',
    workingDaysPerWeek: '5',
  });

  const handleInputChange = (field: string, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSave = () => {
    // Save configuration logic
    alert('Configuration saved successfully!');
  };

  const handleReset = () => {
    // Reset to default values
    setConfig({
      overtimeRate: '1.5',
      holidayRate: '2.0',
      baseSalary: '15.00',
      latePenalty: '5.00',
      absentPenalty: '50.00',
      workingHoursPerDay: '8',
      workingDaysPerWeek: '5',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>System Configuration</h2>
        <p className={`text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure system default values for payroll calculations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pay Rates */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Pay Rates</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Base Salary (per hour)
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  RM
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={config.baseSalary}
                  onChange={(e) => handleInputChange('baseSalary', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Standard hourly rate for regular working hours
              </p>
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Overtime Rate Multiplier
              </label>
              <div className="relative">
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  x
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={config.overtimeRate}
                  onChange={(e) => handleInputChange('overtimeRate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Multiplier for overtime hours (e.g., 1.5 = time and a half)
              </p>
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Holiday Rate Multiplier
              </label>
              <div className="relative">
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  x
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={config.holidayRate}
                  onChange={(e) => handleInputChange('holidayRate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Multiplier for holiday hours (e.g., 2.0 = double time)
              </p>
            </div>
          </div>
        </div>

        {/* Penalties */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Penalties</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Late Arrival Penalty
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  RM
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={config.latePenalty}
                  onChange={(e) => handleInputChange('latePenalty', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Deduction per late clock-in incident
              </p>
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Absence Penalty
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  RM
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={config.absentPenalty}
                  onChange={(e) => handleInputChange('absentPenalty', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Deduction per unexcused absence
              </p>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Working Hours</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Standard Hours Per Day
              </label>
              <input
                type="number"
                step="1"
                value={config.workingHoursPerDay}
                onChange={(e) => handleInputChange('workingHoursPerDay', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Standard working hours before overtime applies
              </p>
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Working Days Per Week
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="7"
                value={config.workingDaysPerWeek}
                onChange={(e) => handleInputChange('workingDaysPerWeek', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
              <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Standard working days in a week
              </p>
            </div>
          </div>
        </div>

        {/* Calculation Preview */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-2 border-red-600' : 'bg-white border-2 border-red-100'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-red-600" />
            <h3 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>Calculation Preview</h3>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Regular Hour Rate
              </div>
              <div className={`text-xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                RM {config.baseSalary}/hour
              </div>
            </div>

            <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Overtime Hour Rate
              </div>
              <div className={`text-xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                RM {(parseFloat(config.baseSalary) * parseFloat(config.overtimeRate)).toFixed(2)}/hour
              </div>
            </div>

            <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Holiday Hour Rate
              </div>
              <div className={`text-xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                RM {(parseFloat(config.baseSalary) * parseFloat(config.holidayRate)).toFixed(2)}/hour
              </div>
            </div>

            <div className={`p-3 rounded-lg transition-colors duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Weekly Base Salary
              </div>
              <div className={`text-xl transition-colors duration-500 ${isDarkMode ? 'text-white' : ''}`}>
                RM {(parseFloat(config.baseSalary) * parseFloat(config.workingHoursPerDay) * parseFloat(config.workingDaysPerWeek)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
        >
          <Save className="w-5 h-5" />
          Save Configuration
        </button>
        <button
          onClick={handleReset}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset to Default
        </button>
      </div>
    </div>
  );
}
