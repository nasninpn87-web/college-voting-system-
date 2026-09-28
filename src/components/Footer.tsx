import React from 'react';
import { useElection } from '../context/ElectionContext';

export const Footer: React.FC = () => {
  const { setCurrentScreen } = useElection();

  return (
    <footer className="relative z-10 w-full bg-white/85 backdrop-blur-xl mt-8 border-t border-[#0d1c2e]/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#ff6b00] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[13px]">how_to_vote</span>
          </div>
          <span className="font-display font-semibold text-sm text-[#0d1c2e]">CampusVote</span>
          <span className="text-[#8e7164] text-xs hidden sm:inline">
            © 2025 Collegiate Democratic Governance Board
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <button
            onClick={() => setCurrentScreen('overview')}
            className="font-medium text-[#565e74] hover:text-[#ff6b00] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => setCurrentScreen('student-voter-candidate-booth')}
            className="font-medium text-[#565e74] hover:text-[#ff6b00] transition-colors cursor-pointer"
          >
            Vote
          </button>
          <button
            onClick={() => setCurrentScreen('login-gateway')}
            className="font-medium text-[#565e74] hover:text-[#ff6b00] transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </footer>
  );
};
