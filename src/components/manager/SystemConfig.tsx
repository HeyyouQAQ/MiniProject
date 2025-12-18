import { useState, useEffect } from 'react';
import { Save, RotateCcw, Clock, Calendar, CreditCard, UserCheck, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SystemConfigProps {
  isDarkMode: boolean;
}

export function SystemConfig({ isDarkMode }: SystemConfigProps) {
  const [isLoading, setIsLoading] = useState(true);

  // New Config State to match Schema
  const [config, setConfig] = useState({
    defaultAnnualLeaveDays: '15',
    defaultSickLeaveDays: '14',
    carryForwardLeaveLimit: '5',
    payrollCycleDay: '25',
    otRatePerHour: '1.50',
    minimumOTMinutes: '30',
    latePenaltyAmount: '5.00',
    absencePenaltyAmount: '20.00',
    minimumShiftBreakMins: '60',
    maxLateMinsAllowed: '10',
    maxDailyWorkingHours: '8',
    maxWeeklyWorkingHours: '48',
    minimumShiftHours: '4'
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
              defaultSickLeaveDays: data.systemConfig.defaultSickLeaveDays || '14',
              carryForwardLeaveLimit: data.systemConfig.carryForwardLeaveLimit || '5',
              payrollCycleDay: data.systemConfig.payrollCycleDay || '25',
              otRatePerHour: data.systemConfig.otRatePerHour || '1.50',
              minimumOTMinutes: data.systemConfig.minimumOTMinutes || '30',
              latePenaltyAmount: data.systemConfig.latePenaltyAmount || '5.00',
              absencePenaltyAmount: data.systemConfig.absencePenaltyAmount || '20.00',
              minimumShiftBreakMins: data.systemConfig.minimumShiftBreakMins || '60',
              maxLateMinsAllowed: data.systemConfig.maxLateMinsAllowed || '10',
              maxDailyWorkingHours: data.systemConfig.maxDailyWorkingHours || '8',
              maxWeeklyWorkingHours: data.systemConfig.maxWeeklyWorkingHours || '48',
              minimumShiftHours: data.systemConfig.minimumShiftHours || '4'
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
      defaultSickLeaveDays: '14',
      carryForwardLeaveLimit: '5',
      payrollCycleDay: '25',
      otRatePerHour: '1.50',
      minimumOTMinutes: '30',
      latePenaltyAmount: '5.00',
      absencePenaltyAmount: '20.00',
      minimumShiftBreakMins: '60',
      maxLateMinsAllowed: '10',
      maxDailyWorkingHours: '8',
      maxWeeklyWorkingHours: '48',
      minimumShiftHours: '4'
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
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header Area: Compact Title + Actions */}
      <div className={`p-4 rounded-lg shadow-sm flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div>
          <h2 className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configuration Center</h2>
          <p className={`text-xs mt-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage system-wide parameters and rules
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 text-sm rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full flex-1 flex flex-col">
        <TabsList className={`w-full justify-start rounded-xl p-1 mb-6 border ${isDarkMode ? 'bg-black/20 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <TabsTrigger
            value="general"
            className={`flex-1 max-w-[240px] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300
              ${isDarkMode
                ? 'text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md'
                : 'text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm border-transparent data-[state=active]:border-gray-200'
              }
            `}
          >
            General Configuration
          </TabsTrigger>
          <TabsTrigger
            value="overtime"
            className={`flex-1 max-w-[240px] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300
              ${isDarkMode
                ? 'text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md'
                : 'text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm border-transparent data-[state=active]:border-gray-200'
              }
            `}
          >
            Overtime Rules
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Config */}
        <TabsContent value="general" className="space-y-4 animate-in fade-in-50 duration-500">
          <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Compact Grid Layout: 2 Main Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* LEFT COLUMN: Leave & Payroll */}
              <div className="space-y-6">
                {/* Section: Leave */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <h4 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Leave Settings</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Annual Days</label>
                      <input type="number" value={config.defaultAnnualLeaveDays} onChange={(e) => handleInputChange('defaultAnnualLeaveDays', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sick Days</label>
                      <input type="number" value={config.defaultSickLeaveDays} onChange={(e) => handleInputChange('defaultSickLeaveDays', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Carry Fwd</label>
                      <input type="number" value={config.carryForwardLeaveLimit} onChange={(e) => handleInputChange('carryForwardLeaveLimit', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Section: Payroll */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <h4 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Payroll Settings</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cycle Day (1-28)</label>
                      <input type="number" min="1" max="28" value={config.payrollCycleDay} onChange={(e) => handleInputChange('payrollCycleDay', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>OT Rate / Hr</label>
                      <input type="number" step="0.01" value={config.otRatePerHour} onChange={(e) => handleInputChange('otRatePerHour', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Late Penalty (RM)</label>
                      <input type="number" step="0.01" value={config.latePenaltyAmount} onChange={(e) => handleInputChange('latePenaltyAmount', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Absence Penalty (RM)</label>
                      <input type="number" step="0.01" value={config.absencePenaltyAmount} onChange={(e) => handleInputChange('absencePenaltyAmount', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div className="col-span-2">
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min OT Duration (Mins)</label>
                      <input type="number" value={config.minimumOTMinutes} onChange={(e) => handleInputChange('minimumOTMinutes', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Attendance & Shift */}
              <div className="space-y-6">
                {/* Section: Attendance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <h4 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Attendance Rules</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Shift Break (Mins)</label>
                      <input type="number" value={config.minimumShiftBreakMins} onChange={(e) => handleInputChange('minimumShiftBreakMins', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Late (Mins)</label>
                      <input type="number" value={config.maxLateMinsAllowed} onChange={(e) => handleInputChange('maxLateMinsAllowed', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Section: Scheduling */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <h4 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Scheduling Limits</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Daily Hours</label>
                      <input type="number" value={config.maxDailyWorkingHours} onChange={(e) => handleInputChange('maxDailyWorkingHours', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div>
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Weekly Hours</label>
                      <input type="number" value={config.maxWeeklyWorkingHours} onChange={(e) => handleInputChange('maxWeeklyWorkingHours', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                    <div className="col-span-2">
                      <label className={`block mb-1 text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Shift Duration (Hours)</label>
                      <input type="number" value={config.minimumShiftHours} onChange={(e) => handleInputChange('minimumShiftHours', e.target.value)}
                        className={`w-full px-3 py-2 border rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Overtime Rules */}
        <TabsContent value="overtime" className="space-y-4 animate-in fade-in-50 duration-500">
          <div className={`rounded-lg shadow-sm p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className={`font-semibold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overtime Multipliers & Triggers</h3>
            </div>
            {rules.length === 0 && <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No rules found.</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule: any, index: number) => (
                <div key={rule.ruleId} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rule.ruleName}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Factor (x)</label>
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
                      <label className={`block text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trigger (Hrs)</label>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
