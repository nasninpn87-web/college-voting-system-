import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import { DEMO_USERS } from '../../data/mockData';
import { UserRole } from '../../types/election';

// Static credentials for non-student roles
const STATIC_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'admin': { password: 'admin123', userId: 'user-admin' },
  'dean.vance': { password: 'admin123', userId: 'user-admin' },
  'officer': { password: 'officer123', userId: 'user-officer' },
  'marcus.thorne': { password: 'officer123', userId: 'user-officer' },
};

export const LoginGateway: React.FC = () => {
  const { switchUser, setCurrentScreen, setCurrentUser, showToast, students } = useElection();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const key = identifier.trim().toLowerCase();

    // 1) Check static credentials (admin, officer)
    const staticCred = STATIC_CREDENTIALS[key];
    if (staticCred && staticCred.password === password) {
      setIsAuthenticating(true);
      setTimeout(() => {
        const user = DEMO_USERS.find(u => u.id === staticCred.userId);
        switchUser(staticCred.userId);
        setIsAuthenticating(false);
        if (user?.role === 'super-admin') {
          setCurrentScreen('admin-portal');
          showToast(`Welcome, ${user.name} — Admin Portal`, 'admin_panel_settings');
        } else if (user?.role === 'department-officer') {
          setCurrentScreen('department-officer');
          showToast(`Welcome, ${user.name} — Officer Terminal`, 'domain_verification');
        } else {
          setCurrentScreen('overview');
          showToast(`Welcome, ${user?.name}`, 'person');
        }
      }, 700);
      return;
    }

    // 2) Check student registry (dynamic credentials issued by department)
    const student = students.find(s => s.studentId.toLowerCase() === key);
    if (student && student.password === password) {
      setIsAuthenticating(true);
      setTimeout(() => {
        // Log in as student-voter with their actual data
        setCurrentUser({
          id: `user-${student.studentId}`,
          name: student.name,
          roleTitle: `Enrolled Voter (${student.year})`,
          role: 'student-voter',
          department: student.dept,
          studentId: student.studentId,
          hasVoted: student.hasVoted,
          avatarUrl: '',
        });
        setIsAuthenticating(false);
        setCurrentScreen('student-voter-candidate-booth');
        showToast(`Welcome, ${student.name} — Voter Booth`, 'how_to_vote');
      }, 700);
      return;
    }

    // 3) Nothing matched
    setError('Invalid Student ID or password. Contact your department officer for credentials.');
  };

  const DEMO_HINTS = [
    { label: 'Student Voter', user: 'STU-9842', pass: 'pass123', role: 'student-voter' as UserRole },
    { label: 'Admin', user: 'admin', pass: 'admin123', role: 'super-admin' as UserRole },
    { label: 'Dept Officer', user: 'officer', pass: 'officer123', role: 'department-officer' as UserRole },
  ];

  const fillHint = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff6b00]/10 text-[#ff6b00] mx-auto mb-2">
            <span className="material-symbols-outlined text-3xl">how_to_vote</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0d1c2e]">
            Sign in to CampusVote
          </h1>
          <p className="text-sm text-[#565e74]">
            Use your student ID, username, or email
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 flex flex-col gap-5">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Identifier field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cv-identifier" className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
                Student ID or Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#8e7164] text-[18px]">
                  person
                </span>
                <input
                  id="cv-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  placeholder="e.g. STU-9842 or admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 text-sm text-[#0d1c2e] outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cv-password" className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#8e7164] text-[18px]">
                  lock
                </span>
                <input
                  id="cv-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#eff4ff] border border-transparent focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 text-sm text-[#0d1c2e] outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-2.5 text-[#8e7164] hover:text-[#0d1c2e] cursor-pointer"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-1 w-full py-3 rounded-xl bg-[#ff6b00] hover:bg-[#a04100] text-white font-bold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isAuthenticating ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Quick Logins */}
        <div className="flex flex-col gap-2">
          <p className="text-center text-xs font-semibold text-[#8e7164] uppercase tracking-wider">
            Demo Quick Login
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DEMO_HINTS.map(hint => (
              <button
                key={hint.label}
                onClick={() => fillHint(hint.user, hint.pass)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer hover:shadow-sm group ${
                  hint.role === 'super-admin'
                    ? 'bg-[#ffdbcc]/40 border-[#ff6b00]/20 hover:border-[#ff6b00]/50'
                    : hint.role === 'student-voter'
                    ? 'bg-emerald-50 border-emerald-200/60 hover:border-emerald-400'
                    : hint.role === 'candidate'
                    ? 'bg-purple-50 border-purple-200/60 hover:border-purple-400'
                    : 'bg-[#eff4ff] border-slate-200/60 hover:border-slate-400'
                }`}
              >
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                  hint.role === 'super-admin' ? 'text-[#a04100]'
                  : hint.role === 'student-voter' ? 'text-emerald-700'
                  : hint.role === 'candidate' ? 'text-purple-700'
                  : 'text-blue-700'
                }`}>
                  {hint.label}
                </span>
                <span className="text-xs font-mono text-[#0d1c2e] font-semibold">{hint.user}</span>
                <span className="text-[11px] text-[#8e7164]">pw: {hint.pass}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-[#8e7164] mt-1">
            Click a card to fill credentials, then Sign In.
          </p>
        </div>

        {/* Back to Overview */}
        <button
          onClick={() => setCurrentScreen('overview')}
          className="text-xs font-semibold text-[#565e74] hover:text-[#ff6b00] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Overview
        </button>
      </div>
    </div>
  );
};
