import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import api from '../api';

export default function Auth_Login() {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/wj/login', { 
                Username: creds.username, 
                Password: creds.password 
            });
    
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('hyUserId', res.data.hyUserId);
            
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Login error details:", err.response?.data);
            alert("Login Failed: " + (err.response?.data || "Check your credentials"));
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#1e40af] relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[80px] opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px] opacity-40"></div>

            <div className="relative z-10 w-full max-lg px-6 text-center text-white">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Stu&Teach Platform</h1>
                <h2 className="text-5xl font-semibold mb-2">Login</h2>
                <p className="text-gray-200 mb-10">Please enter your Login and your Password</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <User className="h-6 w-6 text-white/80" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Username"
                            className="w-full bg-white/10 border-2 border-white/30 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-white/60 outline-none focus:border-white/60 transition-all"
                            onChange={e => setCreds({...creds, username: e.target.value})}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Lock className="h-6 w-6 text-white/80" />
                        </div>
                        <input 
                            type="password"
                            placeholder="Password"
                            className="w-full bg-white/10 border-2 border-white/30 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-white/60 outline-none focus:border-white/60 transition-all"
                            onChange={e => setCreds({...creds, password: e.target.value})}
                        />
                    </div>

                    <div className="text-right">
                        <button 
                            type="button" 
                            onClick={() => navigate('/forgot-password')} 
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#172554] border-2 border-green-600 py-4 rounded-2xl text-xl font-bold text-green-500 hover:bg-[#1e293b] transition-all"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-8 text-lg font-medium">
                    Not a member yet? <button onClick={() => navigate('/register')} className="text-blue-400 italic hover:underline">Register!</button>
                </p>
            </div>
        </div>
    );
}