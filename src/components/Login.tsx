import { useState } from "react";
import { User, Lock } from "lucide-react";
import "./Login.css";

interface LoginProps {
    onLogin: (role: 'staff' | 'manager' | 'hr') => void;
}

export function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        // Role-based authentication logic
        if (username.toLowerCase() === 'admin' && password) {
            onLogin('manager');
        } else if (username.toLowerCase() === 'hr' && password) {
            onLogin('hr');
        } else if (password) {
            // Default to staff for other logical credentials
            onLogin('staff');
        } else {
            setError("Invalid credentials");
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
                                <h1>WcDonald System</h1>
                                <p>Staff Portal</p>
                            </div>
                        </div>

                        <div className="welcome-text">
                            <h2>Welcome Back</h2>
                            <p>Sign in to WcDonald Portal</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="error-alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="input-group">
                                <label htmlFor="username">Username</label>
                                <div className="input-field">
                                    <User className="icon" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Enter your username"
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
                                <label className="remember-me">
                                    <input type="checkbox" name="remember" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">Forgot password?</a>
                            </div>

                            <button type="submit" className="sign-in-btn">Sign In</button>
                        </form>

                        <p className="footer-text">Protected by WcDonald Secure System</p>

                        <div className="demo-alert">
                            Demo: Enter any username and password to login
                        </div>
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
