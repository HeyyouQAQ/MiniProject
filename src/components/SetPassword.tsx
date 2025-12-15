import { useState, useEffect } from 'react';

import { fetchApi } from '../utils/api';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export function SetPassword() {
    // Native URL parsing handled in useEffect
    const [token, setToken] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        setToken(tokenParam);

        if (!tokenParam) {
            setError('Invalid or missing invitation link.');
            setIsValidating(false);
            return;
        }

        // Verify token on mount
        fetchApi(`users.php?action=verify_token&token=${tokenParam}`)
            .then(data => {
                if (data.valid) {
                    setIsValidToken(true);
                    setUserName(data.userName);
                } else {
                    setError(data.message || 'Link invalid or expired (Unknown Reason).');
                }
            })
            .catch(err => setError('Failed to verify invitation.'))
            .finally(() => setIsValidating(false));
    }, []);


    const validatePassword = (pass: string) => {
        const hasMinLength = pass.length >= 8;
        const hasNumber = /\d/.test(pass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        return { hasMinLength, hasNumber, hasSpecialChar, isValid: hasMinLength && hasNumber && hasSpecialChar };
    };

    const passwordStrength = validatePassword(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match"); return;
        }

        const validation = validatePassword(password);
        if (!validation.isValid) {
            alert("Password must be at least 8 characters long and include numbers and special characters.");
            return;
        }

        try {
            await fetchApi('users.php?action=set_password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });
            setSuccess(true);
            setTimeout(() => window.location.href = '/', 3000); // Redirect to login
        } catch (err: any) {
            alert(err.message || "Failed to set password");
        }
    };

    if (isValidating) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Verifying invitation...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="text-red-500 mb-4 text-5xl">⚠</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => window.location.href = '/'} className="text-blue-600 hover:underline">Back to Login</button>
                </div>
            </div>
        );
    }


    const isFormValid = passwordStrength.isValid && password === confirmPassword && password.length > 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}!</h1>
                    <p className="text-sm text-gray-500 mt-2">Set your secure password to access your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent outline-none transition-all pl-10 ${password && !passwordStrength.isValid ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                placeholder="Enter new password"
                                required
                            />
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {/* Password Strength Indicators */}
                        {password && (
                            <div className="text-xs space-y-1 mt-2">
                                <p className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}>
                                    • At least 8 characters
                                </p>
                                <p className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                                    • At least 1 number
                                </p>
                                <p className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                                    • At least 1 special character (@$!%*?&)
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all pl-10 ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
                                placeholder="Confirm new password"
                                required
                            />
                            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/'}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        {/* Define your styles separately for clarity */}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-lg transform ${isFormValid
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/30 hover:scale-[1.02] cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
