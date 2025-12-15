import { useState, useEffect } from 'react';
import { Save, RotateCcw, Clock, Settings } from 'lucide-react';
import { fetchApi } from '../../utils/api';

interface SystemConfigProps {
  isDarkMode: boolean;
}

export function SystemConfig({ isDarkMode }: SystemConfigProps) {
  const [isLoading, setIsLoading] = useState(true);

  // New Config State to match Schema
  const [config, setConfig] = useState({
    defaultAnnualLeaveDays: '15',
    payrollCycleDay: '1',
    qrTokenExportMins: '60',
    minimumShiftBreakMins: '30',
    latePenaltyAmount: '5.00'
  });

  const [rules, setRules] = useState<any[]>([]);

  // Fetch config on load
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchApi('config.php');
        if (data) {
          if (data.systemConfig) {
            setConfig({
              defaultAnnualLeaveDays: data.systemConfig.defaultAnnualLeaveDays || '15',
              payrollCycleDay: data.systemConfig.payrollCycleDay || '1',
              qrTokenExportMins: data.systemConfig.qrTokenExportMins || '60',
              minimumShiftBreakMins: data.systemConfig.minimumShiftBreakMins || '30',
              latePenaltyAmount: data.systemConfig.latePenaltyAmount || '5.00'
            });
          }
          if (Array.isArray(data.overtimeRules)) {
            setRules(data.overtimeRules);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSave = async () => {
    try {
      const result = await fetchApi('config.php', {
        method: 'POST',
        body: JSON.stringify({
          systemConfig: config,
          overtimeRules: rules
        })
      });

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      alert('Configuration saved successfully!');
    } catch (e: any) {
      console.error(e);
      alert('Failed to save configuration: ' + e.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to default? This action cannot be undone.")) {
      return;
    }

    // Default System Config
    const defaultSysConfig = {
      defaultAnnualLeaveDays: '15',
      payrollCycleDay: '1',
      qrTokenExportMins: '60',
      minimumShiftBreakMins: '30',
      latePenaltyAmount: '5.00'
    };

    // Default Overtime Rules (Map by ID or Name if possible, here we assume standard set)
    // We map over existing rules to preserve IDs, resetting values based on known defaults
    const defaultRules = rules.map(rule => {
      let factoryRule = { factor: 1.0, requiredHoursTrigger: 8.0 }; // Fallback

      switch (rule.ruleId) { // Using ID as per user provided INSERT statements
        case '1': // Normal Working Day OT
        case 1:
          factoryRule = { factor: 1.50, requiredHoursTrigger: 8.00 };
          break;
        case '2': // Rest Day OT (Post-8 Hrs)
        case 2:
          factoryRule = { factor: 2.00, requiredHoursTrigger: 8.00 };
          break;
        case '3': // Public Holiday OT
        case 3:
          factoryRule = { factor: 3.00, requiredHoursTrigger: 8.00 };
          break;
        case '4': // PH - Normal Hours Rate
        case 4:
          factoryRule = { factor: 2.00, requiredHoursTrigger: 0.00 };
          break;
        default:
          // Keep existing if unknown or standard fallback? 
          // Let's assume we reset known ones, keep others or reset to 1.0?
          // For safety, let's keep existing values for unknown rules to avoid breakage
          return rule;
      }
      return { ...rule, ...factoryRule };
    });

    try {
      // Optimistic Update
      setConfig(defaultSysConfig);
      setRules(defaultRules);

      const result = await fetchApi('config.php', {
        method: 'POST',
        body: JSON.stringify({
          systemConfig: defaultSysConfig,
          overtimeRules: defaultRules
        })
      });

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      alert('Settings have been reset to defaults.');
    } catch (e: any) {
      console.error(e);
      alert('Failed to reset settings: ' + e.message);
      // Re-fetch to revert UI? 
      // Ideally yes, but page refresh works too.
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`transition-colors duration-500 ${isDarkMode ? 'text-white' : ''} text-2xl font-bold`}>System Settings</h2>
        <p className={`text-sm mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure core HR system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Settings */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-red-600" />
            <h3 className={`font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>General Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Default Annual Leave (Days)
              </label>
              <input
                type="number"
                value={config.defaultAnnualLeaveDays}
                onChange={(e) => handleInputChange('defaultAnnualLeaveDays', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Payroll Cycle Start Day (1-28)
              </label>
              <input
                type="number"
                min="1" max="28"
                value={config.payrollCycleDay}
                onChange={(e) => handleInputChange('payrollCycleDay', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Minimum Shift Break (Mins)
              </label>
              <input
                type="number"
                value={config.minimumShiftBreakMins}
                onChange={(e) => handleInputChange('minimumShiftBreakMins', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                QR Token Export (Mins)
              </label>
              <input
                type="number"
                value={config.qrTokenExportMins}
                onChange={(e) => handleInputChange('qrTokenExportMins', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>

            <div>
              <label className={`block mb-2 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Late Penalty Amount (RM)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.latePenaltyAmount || ''}
                onChange={(e) => handleInputChange('latePenaltyAmount', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base transition-colors duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Overtime Rules (Editable) */}
        <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className={`font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overtime Rules</h3>
          </div>
          <div className="space-y-4">
            {rules.length === 0 && <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No rules found.</p>}
            {rules.map((rule: any, index: number) => (
              <div key={rule.ruleId} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rule.ruleName}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Factor (Multiplier)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={rule.factor}
                      onChange={(e) => {
                        const newRules = [...rules];
                        newRules[index].factor = parseFloat(e.target.value);
                        setRules(newRules);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trigger After (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={rule.requiredHoursTrigger}
                      onChange={(e) => {
                        const newRules = [...rules];
                        newRules[index].requiredHoursTrigger = parseFloat(e.target.value);
                        setRules(newRules);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors duration-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
