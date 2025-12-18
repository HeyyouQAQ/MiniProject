import { useState } from "react";
import { User, Lock, Loader2 } from "lucide-react";
import { fetchApi } from "../utils/api";
import "./Login.css";

interface LoginProps {
    onLogin: (role: 'staff' | 'manager' | 'hr') => void;
}

export function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password State
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await fetchApi('users.php?action=forgot_password', {
                method: 'POST',
                body: JSON.stringify({ email: resetEmail })
            });

            if (response.status === 'success') {
                setSuccessMessage(response.message);
                setResetEmail("");
            } else {
                setError(response.message || "Failed to request reset");
            }
        } catch (err: any) {
            setError(err.message || "Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            // API Call
            // Note: users.php uses $_POST retrieval if content-type is form-data or JSON parsing if raw.
            // Using JSON for consistency with other parts if possible, but our PHP helper checks both.
            // Let's use standard POST body.

            const response = await fetchApi('users.php?action=login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.status === 'success') {
                const apiRole = response.role; // 'manager', 'staff', 'hr'

                // Map Backend Role to Frontend Route Role
                // Frontend App.tsx expects: 'staff' | 'manager' | 'hr'
                let appRole: 'staff' | 'manager' | 'hr' = 'staff';

                if (apiRole === 'manager') appRole = 'manager';
                else if (apiRole === 'hr') appRole = 'hr';
                else if (apiRole === 'staff') appRole = 'staff';

                // You might want to store user info in context/local storage here
                const userWithRole = { ...response.user, role: apiRole };
                localStorage.setItem('currentUser', JSON.stringify(userWithRole));

                onLogin(appRole);
            } else {
                setError(response.message || "Login failed");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-form-section">
                    <div className="login-card">

                        <div className="brand-header">
                            <div className="logo-circle">M</div>
                            <div>
                                <h1>WcDonald Portal</h1>
                                <p>Staff Portal</p>
                            </div>
                        </div>

                        <div className="welcome-text">
                            <h2>{showForgotPassword ? "Reset Password" : "Welcome Back"}</h2>
                            <p>{showForgotPassword ? "Enter your email to recover your account" : "Sign in to WcDonald Portal"}</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="error-alert">
                                {error}
                            </div>
                        )}

                        {/* Success Alert */}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                                {successMessage}
                            </div>
                        )}

                        {!showForgotPassword && (
                            <form onSubmit={handleSubmit}>

                                <div className="input-group">
                                    <label htmlFor="username">Username or Email</label>
                                    <div className="input-field">
                                        <User className="icon" />
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder="Enter your username or email"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="input-field">
                                        <Lock className="icon" />
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-options">
                                    <button type="button" onClick={() => setShowForgotPassword(true)} className="forgot-password text-sm text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer">
                                        Forgot password?
                                    </button>
                                </div>

                                <button type="submit" className="sign-in-btn" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin w-4 h-4" /> Signing In...
                                        </span>
                                    ) : "Sign In"}
                                </button>
                            </form>
                        )}

                        {showForgotPassword && (
                            <form onSubmit={handleForgotPassword}>
                                <div className="input-group mb-6">
                                    <label htmlFor="reset-email">Enter your email</label>
                                    <div className="input-field">
                                        <User className="icon" />
                                        <input
                                            type="email"
                                            id="reset-email"
                                            placeholder="name@wcdonald.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        We'll send a password recovery link to your inbox.
                                    </p>
                                </div>

                                <button type="submit" className="sign-in-btn mb-4" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin w-4 h-4" /> Sending...
                                        </span>
                                    ) : "Send Reset Link"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setShowForgotPassword(false); setError(""); setSuccessMessage(""); }}
                                    className="w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </form>
                        )}

                        <p className="footer-text">Protected by WcDonald Secure System</p>
                    </div>
                </div>

                <div className="branding-section">
                    <div className="branding-content">
                        <div className="image-container">
                            <img src="https://img.buzzfeed.com/buzzfeed-static/static/2016-01/5/13/enhanced/webdr11/longform-original-16767-1452017688-3.png?downsize=700%3A%2A&output-quality=auto&output-format=auto" alt="WcDonald Restaurant" />
                        </div>
                        <h2>WcDonald Staff Portal</h2>
                        <p>Manage your schedule, attendance, and payroll all in one place</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
