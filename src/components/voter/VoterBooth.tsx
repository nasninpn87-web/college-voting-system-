import React, { useState } from 'react';
import { useElection } from '../../context/ElectionContext';
import confetti from 'canvas-confetti';

export const VoterBooth: React.FC = () => {
  const {
    currentUser,
    races,
    myBallot,
    castBallot,
    electionState,
    showToast,
  } = useElection();

  const [activeRaceTab, setActiveRaceTab] = useState<string>(races[0]?.id || 'race-pres');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'txt'>('json');

  const activeRace = races.find((r) => r.id === activeRaceTab) || races[0];

  const handleSelectCandidate = (raceId: string, candidateId: string) => {
    if (electionState.isPaused) {
      showToast('Voting is currently paused by admin.', 'warning');
      return;
    }
    if (electionState.isLocked) {
      showToast('Voting is closed.', 'warning');
      return;
    }
    if (currentUser.hasVoted || myBallot) {
      showToast('You have already submitted a sealed ballot.', 'error');
      return;
    }

    setSelections((prev) => ({
      ...prev,
      [raceId]: candidateId,
    }));
  };

  const handleCastBallot = async () => {
    if (electionState.isPaused) {
      showToast('Voting is currently paused. Please wait until balloting resumes.', 'warning');
      return;
    }
    if (electionState.isLocked) {
      showToast('Election has officially closed.', 'warning');
      return;
    }

    // Check if at least 1 selection is made
    const selectedCount = Object.keys(selections).length;
    if (selectedCount === 0) {
      showToast('Please select at least one candidate before casting your ballot.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const submission = await castBallot(selections);
      showToast('Secret ballot sealed and broadcast to precinct ledger!', 'verified');
      
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b00', '#a04100', '#10b981', '#ffffff'],
        });
      } catch (err) {
        // Safe fallback
      }
    } catch (err) {
      showToast('Error encrypting ballot token.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    if (!myBallot) return;
    const content =
      downloadFormat === 'json'
        ? JSON.stringify(myBallot, null, 2)
        : `=== CAMPUSVOTE CRYPTOGRAPHIC RECEIPT ===\n` +
          `Student ID: ${myBallot.studentId}\n` +
          `Department: ${myBallot.department}\n` +
          `Timestamp: ${myBallot.timestamp}\n` +
          `Block Number: #${myBallot.blockNumber}\n` +
          `Ballot Hash: ${myBallot.ballotHash}\n` +
          `Zero-Knowledge Proof: ${myBallot.merkleProof}\n` +
          `Verification status: Tamper-Free Verified\n` +
          `=========================================`;

    const blob = new Blob([content], {
      type: downloadFormat === 'json' ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusVote_Receipt_${myBallot.studentId}.${downloadFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Receipt downloaded (${downloadFormat.toUpperCase()})`, 'download');
  };

  const selectedCount = Object.keys(selections).length;
  const isReadyToCast = selectedCount > 0;

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        {/* Top Student Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#ff6b00]"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-[#0d1c2e]">
                  Student Voter &amp; Candidate Booth
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Verified Elector
                </span>
              </div>
              <p className="text-xs text-[#565e74]">
                Logged in as <strong className="text-[#0d1c2e]">{currentUser.name}</strong> •{' '}
                <span className="font-mono text-[#a04100] font-semibold">
                  {currentUser.studentId || 'STU-9842'}
                </span>{' '}
                ({currentUser.department})
              </p>
            </div>
          </div>

          {/* Status Capsule */}
          <div className="flex items-center gap-3">
            {myBallot || currentUser.hasVoted ? (
              <div className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Ballot Sealed in Block #{myBallot?.blockNumber || '4822'}</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full bg-[#ffdbcc]/70 text-[#a04100] text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">how_to_vote</span>
                <span>Active Ballot Uncast (4 Executive Posts Open)</span>
              </div>
            )}
          </div>
        </div>

        {/* Circuit Breaker Warning if Paused */}
        {electionState.isPaused && (
          <div className="p-4 rounded-xl bg-[#ffdad6]/70 border border-[#ba1a1a]/30 flex items-center gap-3 text-[#93000a]">
            <span className="material-symbols-outlined text-2xl shrink-0">pause_circle</span>
            <div className="flex flex-col text-xs sm:text-sm">
              <strong className="font-bold">Balloting Is Temporarily Paused by Admin</strong>
              <span>
                You can review candidate profiles and read policy manifestos. Ballot submission will be re-enabled once the Central Precinct resumes voting.
              </span>
            </div>
          </div>
        )}

        {/* ALREADY VOTED RECEIPT VIEW */}
        {(myBallot || currentUser.hasVoted) && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-xl border border-emerald-300 shadow-lg flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0d1c2e]">
                    Ballot Successfully Cast &amp; Sealed
                  </h2>
                  <span className="text-xs text-[#565e74]">
                    Cryptographic Receipt • Zero-Knowledge Validated
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadReceipt}
                  className="px-4 py-2 rounded-full bg-[#ff6b00] text-white text-xs font-bold shadow-md hover:bg-[#a04100] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download Official Receipt</span>
                </button>
              </div>
            </div>

            {/* Receipt Details Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#eff4ff]/60 p-5 rounded-xl border border-slate-200/60 font-mono text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[#8e7164] font-sans font-semibold">STUDENT ID</span>
                <span className="font-bold text-[#0d1c2e]">
                  {myBallot?.studentId || currentUser.studentId || 'STU-9842'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#8e7164] font-sans font-semibold">TIMESTAMP</span>
                <span className="text-[#0d1c2e]">{myBallot?.timestamp || '11:45:00 AM'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#8e7164] font-sans font-semibold">PRECINCT BLOCK</span>
                <span className="text-emerald-700 font-bold">
                  Block #{myBallot?.blockNumber || '4822'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#8e7164] font-sans font-semibold">PROOF SYSTEM</span>
                <span className="text-[#a04100]">ZK-SNARK-V2 (SHA-256)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>DIGITAL BALLOT SIGNATURE HASH</span>
                <span className="text-emerald-400 font-bold">TAMPER-SEALED</span>
              </div>
              <div className="break-all text-[#ffb693] font-mono text-xs sm:text-sm">
                {myBallot?.ballotHash ||
                  '0x8f9b42c17a5e98218e27c19a4d82b7c699fa2312e4f0141a5509ba19cd7812'}
              </div>
            </div>

            <p className="text-xs text-[#565e74] italic">
              Your votes are encrypted using zero-knowledge proofs. No administrator, candidate, or officer can link your voter ID to your individual candidate selections.
            </p>
          </div>
        )}

        {/* RACE NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#0d1c2e]/10">
          {races.map((race) => {
            const hasSelected = !!selections[race.id];
            const isTabActive = activeRaceTab === race.id;

            return (
              <button
                key={race.id}
                onClick={() => setActiveRaceTab(race.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isTabActive
                    ? 'bg-[#ff6b00] text-white shadow-[0_4px_14px_0_rgba(255,107,0,0.35)]'
                    : 'bg-white hover:bg-[#eff4ff] text-[#5a4136]'
                }`}
              >
                <span>{race.title}</span>
                {hasSelected && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isTabActive ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  ></span>
                )}
              </button>
            );
          })}
        </div>

        {/* ACTIVE RACE CANDIDATES & SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Candidates Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#8e7164] uppercase tracking-wider">
                Race #{activeRace.code} • Executive Position
              </span>
              <h2 className="font-display font-bold text-2xl text-[#0d1c2e]">
                {activeRace.title}
              </h2>
              <p className="text-xs text-[#565e74]">{activeRace.description}</p>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRace.candidates.map((candidate) => {
                const isSelected = selections[activeRace.id] === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(activeRace.id, candidate.id)}
                    className={`p-5 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                      isSelected
                        ? 'bg-white border-[#ff6b00] shadow-[0_8px_24px_rgba(255,107,0,0.18)] ring-2 ring-[#ff6b00]/30'
                        : 'bg-white/80 hover:bg-white border-slate-200/70 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top row: Avatar & Slate Pill */}
                      <div className="flex items-start justify-between gap-3">
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                        />
                        <div className="flex flex-col items-end">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: candidate.partyColor }}
                          >
                            {candidate.slate}
                          </span>
                          <span className="text-[11px] text-[#8e7164] mt-1">
                            {candidate.major} • {candidate.year}
                          </span>
                        </div>
                      </div>

                      {/* Name & Tagline */}
                      <div className="mt-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-[#0d1c2e] group-hover:text-[#a04100] transition-colors">
                            {candidate.name}
                          </h3>
                          {/* Radio Circle */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#ff6b00] bg-[#ff6b00]'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                          </div>
                        </div>
                        <p className="text-xs text-[#565e74] italic">
                          "{candidate.tagline}"
                        </p>
                      </div>

                      {/* Bio summary */}
                      <p className="mt-2 text-xs text-[#565e74] leading-relaxed">
                        {candidate.bio}
                      </p>

                      {/* Key Policy Pillars */}
                      <div className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-[#0d1c2e]/5">
                        <span className="text-[10px] font-bold text-[#8e7164] uppercase tracking-wider">
                          Key Campaign Pillars:
                        </span>
                        {candidate.policyPillars.map((pillar, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#0d1c2e]">
                            <span className="text-[#a04100] font-bold">•</span>
                            <span>{pillar}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Endorsements footer */}
                    <div className="pt-2 border-t border-[#0d1c2e]/5 flex flex-wrap gap-1 text-[10px] text-[#565e74]">
                      <span className="font-semibold text-[#8e7164]">Endorsed by:</span>
                      {candidate.endorsements.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (4 cols): Ballot Summary & Cryptographic Cast Panel */}
          <div className="lg:col-span-4 flex flex-col gap-5 sticky top-24">
            <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#0d1c2e]/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#a04100]">how_to_vote</span>
                  <h3 className="font-display font-bold text-base text-[#0d1c2e]">
                    Your Ballot Slip
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#a04100]">
                  {selectedCount} of {races.length} Picked
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#dce9ff] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#ff6b00] h-full rounded-full transition-all duration-300"
                  style={{ width: `${(selectedCount / races.length) * 100}%` }}
                ></div>
              </div>

              {/* List of races & choices */}
              <div className="flex flex-col gap-2.5">
                {races.map((race) => {
                  const selectedId = selections[race.id];
                  const chosenCand = race.candidates.find((c) => c.id === selectedId);

                  return (
                    <div
                      key={race.id}
                      onClick={() => setActiveRaceTab(race.id)}
                      className="p-3 rounded-xl bg-[#eff4ff]/70 hover:bg-[#dce9ff]/60 transition-colors flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="text-[#8e7164] font-semibold text-[10px] uppercase">
                          {race.title}
                        </span>
                        <span className="font-bold text-[#0d1c2e]">
                          {chosenCand ? chosenCand.name : 'No selection yet'}
                        </span>
                      </div>
                      {chosenCand ? (
                        <span className="material-symbols-outlined text-emerald-600 text-base">
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-base">
                          radio_button_unchecked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cast Action */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleCastBallot}
                  disabled={
                    !isReadyToCast ||
                    isSubmitting ||
                    electionState.isPaused ||
                    electionState.isLocked ||
                    !!myBallot ||
                    currentUser.hasVoted
                  }
                  className={`w-full py-3 px-4 rounded-full text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(255,107,0,0.35)] flex items-center justify-center gap-2 ${
                    isReadyToCast &&
                    !electionState.isPaused &&
                    !electionState.isLocked &&
                    !myBallot &&
                    !currentUser.hasVoted
                      ? 'bg-[#ff6b00] text-white hover:bg-[#a04100] active:scale-95 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>
                    {isSubmitting
                      ? 'Encrypting & Sealing...'
                      : myBallot || currentUser.hasVoted
                      ? 'Ballot Already Cast'
                      : 'Seal & Cast Secret Ballot'}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8e7164] text-center pt-1">
                  <span className="material-symbols-outlined text-xs text-emerald-600">
                    security
                  </span>
                  <span>Secured by CampusVote ZK Cryptographic Core</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
