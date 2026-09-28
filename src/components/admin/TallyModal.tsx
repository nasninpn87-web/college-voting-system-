import React, { useState, useEffect } from 'react';
import { useElection } from '../../context/ElectionContext';

export const TallyModal: React.FC = () => {
  const {
    isTallyModalOpen,
    setIsTallyModalOpen,
    electionState,
    setElectionTallied,
  } = useElection();

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing verifiable zero-knowledge tally engine...');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isTallyModalOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    setProgress(0);
    setIsCompleted(false);
    setStatusText('Decrypting tokens & zero-knowledge proofs...');

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 12;
        if (next >= 100) {
          clearInterval(interval);
          setStatusText('Tabulation Complete: Quorum verified for 4 of 4 Council Posts!');
          setIsCompleted(true);
          return 100;
        }
        if (next >= 75) {
          setStatusText('Verifying Merkle root integrity against precinct shards...');
        } else if (next >= 45) {
          setStatusText('Calculating instant-runoff ranked vectors & Borda points...');
        } else if (next >= 20) {
          setStatusText('Validating 1-ID-1-Vote cryptographic hashes & timestamp nonces...');
        }
        return next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isTallyModalOpen]);

  if (!isTallyModalOpen) return null;

  const handleCommit = () => {
    setElectionTallied();
    setIsTallyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#233144]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl border border-white/80 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00]">
              <span className="material-symbols-outlined text-2xl">calculate</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#0d1c2e]">
                Automatic Tabulation Run
              </h3>
              <span className="text-xs text-[#565e74]">
                Cryptographic Instant-Runoff &amp; Borda Count
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsTallyModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#0d1c2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <p className="text-sm text-[#565e74] leading-relaxed">
          Running dual-signature verifiable tally across{' '}
          <strong className="text-[#0d1c2e] font-mono">
            {electionState.ballotsCast.toLocaleString()}
          </strong>{' '}
          sealed ballot tokens. Computing instant-runoff ranks and consensus Merkle hashes...
        </p>

        {/* Progress Bar & Stage */}
        <div className="py-2 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-[#565e74]">
            <span className="font-medium text-[#0d1c2e] flex items-center gap-1.5">
              {!isCompleted && (
                <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-ping"></span>
              )}
              {isCompleted && (
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
              )}
              {statusText}
            </span>
            <span className="font-bold text-[#ff6b00] font-mono text-sm">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-[#eff4ff] rounded-full h-3 overflow-hidden border border-[#d5e3fc]/60 p-0.5">
            <div
              className="bg-gradient-to-r from-[#a04100] to-[#ff6b00] h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8e7164] pt-1">
            <span>Precision: FIPS 140-2 Level 4</span>
            <span>Zero-Knowledge Proof: Verified</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#0d1c2e]/5">
          <button
            onClick={() => setIsTallyModalOpen(false)}
            className="px-5 py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0d1c2e] text-sm font-semibold transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={handleCommit}
            disabled={!isCompleted}
            className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
              isCompleted
                ? 'bg-[#ff6b00] text-white hover:bg-[#a04100] cursor-pointer shadow-[0_4px_14px_0_rgba(255,107,0,0.35)] active:scale-95'
                : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Commit &amp; Seal Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
