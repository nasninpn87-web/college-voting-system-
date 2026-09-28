import React from 'react';
import { useElection } from '../../context/ElectionContext';

export const RaceDetailModal: React.FC = () => {
  const { selectedRaceForDetail, setSelectedRaceForDetail } = useElection();

  if (!selectedRaceForDetail) return null;

  const totalVotes = selectedRaceForDetail.totalVotes || 1;

  return (
    <div className="fixed inset-0 z-50 bg-[#233144]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl border border-white/80 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00] font-bold font-display text-xl">
              {selectedRaceForDetail.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">
                  Audited Executive Race
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold">
                  Quorum Met
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl text-[#0d1c2e]">
                {selectedRaceForDetail.title}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedRaceForDetail(null)}
            className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#0d1c2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <p className="text-sm text-[#565e74]">
          {selectedRaceForDetail.description}
        </p>

        {/* Total Votes Summary */}
        <div className="p-4 rounded-xl bg-[#eff4ff] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#8e7164] uppercase">
              Total Validated Ballots
            </span>
            <span className="text-xl font-bold font-mono text-[#0d1c2e]">
              {selectedRaceForDetail.totalVotes.toLocaleString()} Votes
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#a04100] bg-[#ffdbcc]/40 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Cryptographically Verified</span>
          </div>
        </div>

        {/* Candidate List with Live Bar Standings */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8e7164]">
            Contending Candidate Slates &amp; Tabulation
          </h4>

          {selectedRaceForDetail.candidates.map((cand, idx) => {
            const voteShare = ((cand.votes / totalVotes) * 100).toFixed(1);
            const isLeader = idx === 0;

            return (
              <div
                key={cand.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLeader
                    ? 'bg-white border-[#ff6b00]/30 shadow-md ring-1 ring-[#ff6b00]/20'
                    : 'bg-[#eff4ff]/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.photoUrl}
                      alt={cand.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0d1c2e] text-base">
                          {cand.name}
                        </span>
                        {isLeader && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ff6b00]/10 text-[#a04100] font-bold text-[10px]">
                            Leader
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#565e74] font-medium">
                        {cand.slate} • {cand.major} ({cand.year})
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono text-[#0d1c2e]">
                      {voteShare}%
                    </div>
                    <span className="text-xs text-[#8e7164] font-mono">
                      {cand.votes.toLocaleString()} votes
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-[#dce9ff]/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLeader
                        ? 'bg-gradient-to-r from-[#a04100] to-[#ff6b00]'
                        : 'bg-[#565e74]'
                    }`}
                    style={{ width: `${voteShare}%` }}
                  ></div>
                </div>

                {/* Policy preview */}
                <p className="mt-2.5 text-xs text-[#565e74] italic">
                  "{cand.tagline}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setSelectedRaceForDetail(null)}
            className="px-6 py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0d1c2e] text-sm font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
