import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { ScreenType } from '../types/election';

export const Header: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    currentUser,
    electionState,
  } = useElection();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const navItems: { id: ScreenType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Home', icon: 'home' },
    { id: 'student-voter-candidate-booth', label: 'Voter Booth', icon: 'how_to_vote' },
    { id: 'candidate-dashboard', label: 'Candidate', icon: 'campaign' },
    { id: 'department-officer', label: 'Officer', icon: 'domain_verification' },
    { id: 'admin-portal', label: 'Admin', icon: 'admin_panel_settings' },
  ];

  const handleNavClick = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setCurrentScreen('login-gateway');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#0d1c2e]/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* Left: Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => handleNavClick('overview')}
        >
          <div className="w-8 h-8 rounded-xl bg-[#ff6b00] flex items-center justify-center shadow-[0_2px_8px_rgba(255,107,0,0.4)]">
            <span className="material-symbols-outlined text-white text-[18px]">how_to_vote</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-[#0d1c2e] leading-none">
            CampusVote
          </span>
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff6b00]/10 text-[#a04100] text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse"></span>
            <span>Election 2025 Live</span>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#eff4ff]/70 border border-white/60">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#ff6b00] text-white shadow-[0_3px_10px_0_rgba(255,107,0,0.35)]'
                    : 'text-[#565e74] hover:text-[#0d1c2e] hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Timer + User + Login/Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live timer */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff4ff]/80 border border-white/70 text-xs">
            <span className="material-symbols-outlined text-[14px] text-[#a04100]">timer</span>
            <span className="font-mono font-semibold text-[#0d1c2e] tabular-nums">
              {formatTimer(electionState.timeRemainingSeconds)}
            </span>
            <span className="w-px h-3 bg-[#e2bfb0]"></span>
            <span className={`font-medium ${electionState.isPaused ? 'text-amber-700' : electionState.isLocked ? 'text-slate-500' : 'text-emerald-700'}`}>
              {electionState.isPaused ? 'Paused' : electionState.isLocked ? 'Closed' : '● Live'}
            </span>
          </div>

          {/* User chip — shown when not on login screen */}
          {currentScreen !== 'login-gateway' && currentUser && (
            <div className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#eff4ff] border border-white/80">
              <img
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-[#ff6b00]/30"
                src={currentUser.avatarUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-[#0d1c2e]">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-[#565e74]">{currentUser.roleTitle}</span>
              </div>
            </div>
          )}

          {/* Login / Switch Account button */}
          <button
            onClick={handleLogout}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'login-gateway'
                ? 'bg-[#ff6b00] text-white shadow-[0_3px_10px_rgba(255,107,0,0.35)]'
                : 'bg-white hover:bg-[#eff4ff] text-[#565e74] hover:text-[#0d1c2e] border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {currentScreen === 'login-gateway' ? 'login' : 'switch_account'}
            </span>
            <span className="hidden sm:inline">
              {currentScreen === 'login-gateway' ? 'Sign In' : 'Switch'}
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#eff4ff] text-[#0d1c2e] hover:bg-[#dce9ff] transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#0d1c2e]/5 bg-white/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5 ${
                currentScreen === item.id
                  ? 'bg-[#ff6b00] text-white'
                  : 'text-[#565e74] hover:bg-[#eff4ff] hover:text-[#0d1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#a04100] hover:bg-[#ffdbcc]/40 flex items-center gap-2.5 transition-all mt-1 border-t border-[#0d1c2e]/5 pt-3"
          >
            <span className="material-symbols-outlined text-[18px]">switch_account</span>
            Switch Account / Login
          </button>

          <div className="flex items-center justify-between text-[11px] text-[#565e74] px-1 pt-1 border-t border-[#0d1c2e]/5 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {formatTimer(electionState.timeRemainingSeconds)} left
            </span>
            <span className="font-semibold text-[#a04100]">Election 2025 Live</span>
          </div>
        </div>
      )}
    </header>
  );
};
