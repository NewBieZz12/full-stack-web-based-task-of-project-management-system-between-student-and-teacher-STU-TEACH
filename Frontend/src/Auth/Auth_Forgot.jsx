// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Mail, ShieldQuestion, Lock } from 'lucide-react'; 
// import api from '../api';

// export default function Auth_Forgot() {
//     const [data, setData] = useState({ email: '', securityAnswer: '', newPassword: '' });
//     const navigate = useNavigate();

//     const handleReset = async (e) => {
//         e.preventDefault();
//         try {
//             await api.post('/forgot-password', data);
//             alert("Success! Your password has been changed.");
//             navigate('/login');
//         } catch (err) {
//             alert(err.response?.data || "Reset failed. Check your details.");
//         }
//     };

//     return (
//         <div className="min-h-screen w-full flex items-center justify-center bg-[#1e40af] relative overflow-hidden font-sans text-white">
//             {/* Background Abstract Shapes */}
//             <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
//             <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] opacity-30"></div>

//             <div className="relative z-10 w-full max-w-md px-4 text-center">
//                 <h1 className="text-4xl font-bold mb-2 tracking-tight">Reset Password</h1>
//                 <p className="text-gray-200 mb-8 italic text-sm">Verify your identity to choose a new password</p>

//                 <form onSubmit={handleReset} className="space-y-5">
//                     {/* Email Input */}
//                     <div className="relative">
//                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
//                         <input type="email" placeholder="Email Address" required
//                             className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
//                             onChange={e => setData({...data, email: e.target.value})} />
//                     </div>

//                     {/* Security Answer Input */}
//                     <div className="relative">
//                         <ShieldQuestion className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
//                         <input type="text" placeholder="Security Question: Favorite Pet?" required
//                             className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
//                             onChange={e => setData({...data, securityAnswer: e.target.value})} />
//                     </div>

//                     {/* New Password Input */}
//                     <div className="relative">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
//                         <input type="password" placeholder="New Password (8+ chars, Capital, Symbol)" required
//                             className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
//                             onChange={e => setData({...data, newPassword: e.target.value})} />
//                     </div>

//                     {/* Submit Button */}
//                     <button type="submit" 
//                         className="w-full bg-[#1e3a8a] border border-green-600 py-3 rounded-full text-lg font-bold text-green-500 hover:bg-[#172554] transition-all mt-4">
//                         Reset Password
//                     </button>
//                 </form>

//                 <p className="mt-8 text-sm font-medium">
//                     Remembered it? <button onClick={() => navigate('/login')} className="text-blue-400 italic hover:underline">Back to Login</button>
//                 </p>
//             </div>
//         </div>
//     );
// }

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldQuestion, Lock } from 'lucide-react'; 
import api from '../api';

export default function Auth_Forgot() {
    // Keys match C# ForgotPasswordDto (PascalCase)
    const [data, setData] = useState({ Email: '', SecurityAnswer: '', NewPassword: '' });
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            // Added /wj/ prefix to match [Route("api/wj")]
            await api.post('/wj/forgot-password', data);
            alert("Success! Your password has been changed.");
            navigate('/login');
        } catch (err) {
            // Displays the specific error message from your Backend (Regex or Email check)
            alert(err.response?.data || "Reset failed. Check your details.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#1e40af] relative overflow-hidden font-sans text-white">
            <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] opacity-30"></div>

            <div className="relative z-10 w-full max-w-md px-4 text-center">
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Reset Password</h1>
                <p className="text-gray-200 mb-8 italic text-sm">Verify your identity to choose a new password</p>

                <form onSubmit={handleReset} className="space-y-5">
                    {/* Email Input */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input type="email" placeholder="Email Address" required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setData({...data, Email: e.target.value})} />
                    </div>

                    {/* Security Answer Input */}
                    <div className="relative">
                        <ShieldQuestion className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input type="text" placeholder="Security Question: Favorite Pet?" required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setData({...data, SecurityAnswer: e.target.value})} />
                    </div>

                    {/* New Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <input type="password" placeholder="New Password (8+ chars, Capital, Symbol)" required
                            className="w-full bg-white/10 border border-white/40 rounded-full py-3 pl-12 pr-4 outline-none focus:border-white transition-all"
                            onChange={e => setData({...data, NewPassword: e.target.value})} />
                    </div>

                    <button type="submit" 
                        className="w-full bg-[#1e3a8a] border border-green-600 py-3 rounded-full text-lg font-bold text-green-500 hover:bg-[#172554] transition-all mt-4">
                        Reset Password
                    </button>
                </form>

                <p className="mt-8 text-sm font-medium">
                    Remembered it? <button onClick={() => navigate('/login')} className="text-blue-400 italic hover:underline">Back to Login</button>
                </p>
            </div>
        </div>
    );
}