import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../reducers/userSlice';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const endpoint = isLogin ? 'login' : 'register';
            const payload = isLogin ? { email, password } : { email, password, name };
            const res = await axios.post(`http://localhost:5001/auth/${endpoint}`,
                payload,
                { withCredentials: true }
            );
            // For register, we might want to automatically login or show success. 
            // The current backend sends the same structure (user + cookie) for both.
            dispatch(loginSuccess(res.data.user));
        } catch (err) {
            dispatch(loginFailure());
            console.error(err);
            alert("Authentication failed! Check console.");
        }
    };

    return (
        <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-300 font-sans">
            <div className="bg-zinc-900/50 p-8 rounded-xl shadow-2xl border border-white/5 ring-1 ring-black/20 backdrop-blur-sm w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 bg-zinc-950 rounded border border-zinc-800 focus:border-purple-500 outline-none transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors mt-2"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-zinc-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="text-purple-400 cursor-pointer hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;
