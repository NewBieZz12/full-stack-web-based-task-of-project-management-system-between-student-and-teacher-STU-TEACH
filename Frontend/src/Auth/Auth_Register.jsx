import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Key } from 'lucide-react'; 
import api from '../api';

export default function Auth_Register() {
    const [formData, setFormData] = useState({
        Username: '', 
        Email: '', 
        Password: '', 
        Role: 'Student', 
        InvitationCode: '',
        SecurityAnswer: '' 
    });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/wj/register', formData);
            alert("Registration Successful!");
            navigate('/login');
        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string' 
                ? err.response.data 
                : "Registration failed. Check password requirements.";
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#1e40af] relative overflow-hidden font-sans text-white">
            <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] opacity-30"></div>

            <div className="relative z-10 w-full max-w-md px-4 text-center">
                <h1 className="text-4xl font-bold mb-2">Register</h1>
                <p className="text-gray-200 mb-8">Please enter your Name, Email and your Password</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input type="text" placeholder="Username" required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setFormData({...formData, Username: e.target.value})} />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input type="email" placeholder="Email" required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setFormData({...formData, Email: e.target.value})} />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input 
                            type="password" 
                            placeholder="Password (8+ chars, 1 Capital, 1 Symbol)" 
                            required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setFormData({...formData, Password: e.target.value})} 
                        />
                    </div>

                    <div className="text-left px-2">
                        <label className="text-xs font-semibold text-gray-300 ml-2">I am a:</label>
                        <select 
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 px-4 mt-1 outline-none appearance-none cursor-pointer"
                            value={formData.Role}
                            onChange={e => setFormData({...formData, Role: e.target.value})}
                        >
                            <option value="Student" className="text-black">Student</option>
                            <option value="Teacher" className="text-black">Teacher</option>
                        </select>
                    </div>

                    {formData.Role === 'Teacher' && (
                        <div className="relative animate-in slide-in-from-top-2 duration-300">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-400" />
                            <input type="text" placeholder="Teacher Secret Code" required
                                className="w-full bg-white/10 border-2 border-yellow-500/50 rounded-full py-3 pl-12 pr-4 outline-none focus:border-yellow-400 placeholder-yellow-200/60"
                                onChange={e => setFormData({...formData, InvitationCode: e.target.value})} />
                        </div>
                    )}

                    <div className="text-left px-2 mb-4">
                        <label className="text-xs font-semibold text-gray-300 ml-2">What is the nickname only your family uses for you?</label>
                        <div className="relative mt-1">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                            <input 
                                type="text" 
                                placeholder="Your Answer" 
                                required
                                className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                                onChange={e => setFormData({...formData, SecurityAnswer: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button type="submit" 
                        className="w-full bg-[#1e3a8a] border border-green-600 py-3 rounded-full text-lg font-bold text-green-500 hover:bg-[#172554] transition-all mt-4">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-sm font-medium">
                    Already have an Account? <button onClick={() => navigate('/login')} className="text-blue-400 italic hover:underline">Login!</button>
                </p>
            </div>
        </div>
    );
}