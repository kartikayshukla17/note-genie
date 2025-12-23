import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../reducers/userSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

const PasswordInput = ({ value, onChange, placeholder, show, onToggle }) => (
    <div className="relative">
        <input
            type={show ? "text" : "password"}
            placeholder={placeholder}
            className="w-full p-3 pr-10 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
            value={value}
            onChange={onChange}
            autoComplete="new-password"
            required
        />
        <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            onClick={onToggle}
        >
            {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
    </div>
);

const Auth = () => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const dispatch = useDispatch();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const clearFields = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setError('');
        setSuccessMessage('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (mode === 'register') {
            if (name.trim().length < 2) {
                setError('Name must be at least 2 characters');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                dispatch(loginStart());
                const res = await axios.post(`${API_URL}/auth/login`,
                    { email, password },
                    { withCredentials: true }
                );
                dispatch(loginSuccess(res.data.user));
            } else if (mode === 'register') {
                await axios.post(`${API_URL}/auth/register`,
                    { email, password, name },
                    { withCredentials: true }
                );
                setMode('verify-register');
            }
        } catch (err) {
            dispatch(loginFailure());
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            dispatch(loginStart());
            const res = await axios.post(`${API_URL}/auth/verify-otp`,
                { email, otp },
                { withCredentials: true }
            );
            dispatch(loginSuccess(res.data.user));
        } catch (err) {
            dispatch(loginFailure());
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/forgot-password`,
                { email },
                { withCredentials: true }
            );
            setMode('reset-password');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(newPassword)) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/reset-password`,
                { email, otp, newPassword },
                { withCredentials: true }
            );
            setSuccessMessage('Password reset successful! Please login.');
            setMode('login');
            clearFields();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'verify-register') {
        return (
            <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-sans">
                <div className="bg-zinc-900/50 p-8 rounded-xl shadow-2xl border border-white/5 ring-1 ring-black/20 backdrop-blur-sm w-96">
                    <h1 className="text-2xl font-bold mb-2 text-center text-white">Verify Email</h1>
                    <p className="text-sm text-zinc-500 text-center mb-6">We sent a code to {email}</p>
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors text-center text-2xl tracking-widest"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <button type="submit" disabled={loading} className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded font-medium transition-colors">
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </form>
                    <button className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300" onClick={() => { setMode('register'); setOtp(''); }}>← Go back</button>
                </div>
            </div>
        );
    }

    if (mode === 'forgot') {
        return (
            <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-sans">
                <div className="bg-zinc-900/50 p-8 rounded-xl shadow-2xl border border-white/5 ring-1 ring-black/20 backdrop-blur-sm w-96">
                    <h1 className="text-2xl font-bold mb-2 text-center text-white">Forgot Password</h1>
                    <p className="text-sm text-zinc-500 text-center mb-6">Enter your email to receive a reset code</p>
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                    <form onSubmit={handleForgotPassword} className="flex flex-col gap-4" autoComplete="off">
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="off"
                            required
                        />
                        <button type="submit" disabled={loading} className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded font-medium transition-colors">
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                    <button className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300" onClick={() => { setMode('login'); clearFields(); }}>← Back to Login</button>
                </div>
            </div>
        );
    }

    if (mode === 'reset-password') {
        return (
            <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-sans">
                <div className="bg-zinc-900/50 p-8 rounded-xl shadow-2xl border border-white/5 ring-1 ring-black/20 backdrop-blur-sm w-96">
                    <h1 className="text-2xl font-bold mb-2 text-center text-white">Reset Password</h1>
                    <p className="text-sm text-zinc-500 text-center mb-6">Enter the code and your new password</p>
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4" autoComplete="off">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors text-center text-2xl tracking-widest"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            show={showNewPassword}
                            onToggle={() => setShowNewPassword(!showNewPassword)}
                        />
                        <PasswordInput
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            show={showConfirmNewPassword}
                            onToggle={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        />
                        <button type="submit" disabled={loading} className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded font-medium transition-colors">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                    <button className="w-full mt-4 text-sm text-zinc-500 hover:text-zinc-300" onClick={() => { setMode('forgot'); setOtp(''); setNewPassword(''); setConfirmNewPassword(''); }}>← Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-sans">
            <div className="bg-zinc-900/50 p-8 rounded-xl shadow-2xl border border-white/5 ring-1 ring-black/20 backdrop-blur-sm w-96">
                <h1 className="text-2xl font-bold mb-2 text-center text-white">
                    {mode === 'login' ? 'Welcome Back to Note Genie' : 'Sign Up to Note Genie'}
                </h1>
                <p className="text-zinc-500 text-center text-sm mb-6">Start creating notes, managing tasks, and more.</p>
                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                {successMessage && <p className="text-green-400 text-sm text-center mb-4">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                        required
                    />
                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                    />
                    {mode === 'register' && (
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    )}
                    <button type="submit" disabled={loading} className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded font-medium transition-colors mt-2">
                        {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                {mode === 'login' && (
                    <p className="mt-3 text-center">
                        <span className="text-sm text-purple-400 cursor-pointer hover:underline" onClick={() => { setMode('forgot'); clearFields(); }}>Forgot Password?</span>
                    </p>
                )}
                <p className="mt-4 text-center text-sm text-zinc-500">
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="text-purple-400 cursor-pointer hover:underline"
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            clearFields();
                        }}
                    >
                        {mode === 'login' ? 'Sign up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;
