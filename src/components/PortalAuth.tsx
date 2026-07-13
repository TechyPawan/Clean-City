import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Smartphone, 
  Facebook, 
  Check, 
  X, 
  HelpCircle,
  Hash
} from 'lucide-react';

interface PortalAuthProps {
  onLogin: (role: UserRole, email: string, name: string) => void;
}

export default function PortalAuth({ onLogin }: PortalAuthProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('public');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'facebook'>('email');
  
  // Email states
  const [email, setEmail] = useState('citizen1@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Alexander Vance');

  // Phone states
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('555-019-2834');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Facebook states
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [fbName, setFbName] = useState('Alexander Vance');
  const [fbEmail, setFbEmail] = useState('alexander.vance@facebook.com');

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin.dispatch@cityclean.gov');
      setName('Director Marcus Brooks');
      setFbName('Director Marcus Brooks');
      setFbEmail('marcus.brooks@facebook.com');
    } else {
      setEmail('citizen1@gmail.com');
      setName('Alexander Vance');
      setFbName('Alexander Vance');
      setFbEmail('alexander.vance@facebook.com');
    }
    // Reset OTP states on role change
    setOtpSent(false);
    setOtpCode('');
    setOtpError('');
    setOtpSuccess('');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole, email, name);
  };

  const handleSendOtp = () => {
    setOtpError('');
    if (!phoneNumber || phoneNumber.trim().length < 7) {
      setOtpError('Please enter a valid phone number.');
      return;
    }
    // Generate simulated secure 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtpSent(true);
    setOtpSuccess(`[SMS GATEWAY] Secure OTP code sent: ${code}`);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (otpCode !== generatedCode) {
      setOtpError('Invalid verification code. Please inspect the simulated notification below.');
      return;
    }
    const finalEmail = `phone-${phoneNumber.replace(/\D/g, '')}@cityclean.gov`;
    onLogin(selectedRole, finalEmail, selectedRole === 'public' ? name : 'Dispatcher Phone User');
  };

  const handleFacebookConnect = () => {
    setShowFacebookModal(true);
  };

  const handleFacebookConfirm = () => {
    setShowFacebookModal(false);
    onLogin(selectedRole, fbEmail, `${fbName} (Facebook)`);
  };

  return (
    <div id="portal-auth-container" className="max-w-md mx-auto bg-slate-900/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 shadow-neon-emerald space-y-7 relative">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-t-3xl"></div>

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight uppercase">Clean City Command Portal</h2>
        <p className="text-xs text-slate-400">Select portal access type and authenticating channel to sign in</p>
      </div>

      {/* Role Switcher tabs */}
      <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-emerald-500/10">
        <button
          type="button"
          onClick={() => handleRoleToggle('public')}
          className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedRole === 'public'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          <User className="w-4 h-4" />
          Public Citizen
        </button>
        <button
          type="button"
          onClick={() => handleRoleToggle('admin')}
          className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            selectedRole === 'admin'
              ? 'bg-teal-500 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.4)]'
              : 'text-slate-400 hover:text-teal-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Municipal Admin
        </button>
      </div>

      {/* Multi-Method Login Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authentication Channel</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              loginMethod === 'email'
                ? 'bg-slate-950 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email/Key
          </button>

          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              loginMethod === 'phone'
                ? 'bg-slate-950 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Phone SMS
          </button>

          <button
            type="button"
            onClick={() => setLoginMethod('facebook')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              loginMethod === 'facebook'
                ? 'bg-slate-950 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </button>
        </div>
      </div>

      {/* ----------------- EMAIL & PASSWORD FORM ----------------- */}
      {loginMethod === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fadeIn">
          {selectedRole === 'public' && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                placeholder="e.g. name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Access Key / Password</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500"><Lock className="w-4 h-4" /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              selectedRole === 'public'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]'
            }`}
          >
            Sign In with Email
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ----------------- PHONE NUMBER OTP FORM ----------------- */}
      {loginMethod === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-fadeIn">
          {selectedRole === 'public' && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-slate-950 border border-emerald-500/10 rounded-xl px-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
              </select>
              <div className="relative flex-grow">
                <span className="absolute left-3 top-2.5 text-slate-500"><Smartphone className="w-4 h-4" /></span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="e.g. 555-019-2834"
                />
              </div>
            </div>
          </div>

          {/* OTP Code sent field */}
          {otpSent && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex justify-between">
                <span>SMS OTP Code</span>
                <span className="text-slate-500">Simulated SMS Delivery</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500"><Hash className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.25em] font-mono text-center bg-slate-950 border border-emerald-500/20 rounded-xl py-2.5 pl-9 pr-4 text-sm text-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="------"
                />
              </div>
            </div>
          )}

          {otpError && (
            <p className="text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-center leading-normal">
              {otpError}
            </p>
          )}

          {otpSuccess && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SIMULATED INCOMING SMS NOTIFICATION
              </div>
              <p className="text-[10px] text-slate-300 font-mono select-all cursor-pointer bg-slate-950 p-2 rounded border border-emerald-500/10 text-center hover:bg-slate-950/80 transition-colors">
                Your Security Token is: <span className="text-emerald-400 font-bold text-xs">{generatedCode}</span>
              </p>
              <span className="text-[8px] text-slate-500 block text-center leading-normal">Click the code above to copy and paste into the verification field.</span>
            </div>
          )}

          <div className="flex gap-2">
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Send SMS Code
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-slate-700 transition-colors"
                  title="Resend code"
                >
                  Resend
                </button>
                <button
                  type="submit"
                  className="flex-grow py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Verify & Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* ----------------- FACEBOOK INTEGRATION ----------------- */}
      {loginMethod === 'facebook' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-blue-500/15 space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Facebook className="w-6 h-6 fill-blue-400 text-transparent" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fast-Sync Facebook Authentication</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Connect your civic accounts instantly over secure OAuth token exchanges. Requires zero passwords or verification keys.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFacebookConnect}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
          >
            <Facebook className="w-4 h-4 fill-white text-transparent" />
            Continue with Facebook
          </button>
        </div>
      )}

      {/* Info Warning badge on simulated environment */}
      <div className="flex gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-amber-400">
        <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
        <p className="text-[10px] leading-relaxed">
          <span className="font-bold">Sandbox State:</span> External identity gateways are safely simulated within the browser container sandbox to ensure rapid testing without credentials.
        </p>
      </div>

      {/* ----------------- FACEBOOK OAUTH OVERLAY MODAL ----------------- */}
      {showFacebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-blue-500/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.25)] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#1877F2] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 fill-white text-transparent" />
                <span className="font-extrabold text-xs tracking-wider uppercase font-mono">Facebook Identity Sync</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowFacebookModal(false)}
                className="text-white/85 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-left text-xs">
              <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-[#1877F2] font-bold block uppercase tracking-wider">REQUESTED PERMISSIONS</span>
                <p className="text-slate-300 font-semibold leading-relaxed">Clean City Municipal Command will receive access to:</p>
                <ul className="text-[10px] text-slate-400 space-y-1 list-disc pl-4 mt-1 font-mono">
                  <li>Your public name ({selectedRole === 'public' ? 'Alexander Vance' : 'Director Marcus Brooks'})</li>
                  <li>Your public email address ({fbEmail})</li>
                  <li>Your profile photo badge</li>
                </ul>
              </div>

              {/* Editable values for custom profile logins */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Customize Facebook Account Name</label>
                  <input
                    type="text"
                    required
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-500/20 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Facebook Registered Email</label>
                  <input
                    type="email"
                    required
                    value={fbEmail}
                    onChange={(e) => setFbEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-500/20 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <p className="text-[9px] text-slate-500 leading-normal">
                By clicking "Continue", Clean City registers your profile token securely to authenticate reports and award green credits.
              </p>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFacebookModal(false)}
                  className="w-1/3 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700 rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFacebookConfirm}
                  className="flex-grow py-2.5 bg-[#1877F2] hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(24,119,242,0.4)]"
                >
                  <Check className="w-4 h-4" />
                  Continue as {fbName.split(' ')[0]}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
