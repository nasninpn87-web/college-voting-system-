import React from 'react';
import { useElection } from '../../context/ElectionContext';
import { ScreenType } from '../../types/election';

export const HomeOverview: React.FC = () => {
  const {
    setCurrentScreen,
    electionState,
    departments,
    races,
  } = useElection();

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const turnoutPercentage = (
    (electionState.ballotsCast / electionState.totalElectors) * 100
  ).toFixed(1);

  const goTo = (screen: ScreenType) => setCurrentScreen(screen);

  return (
    <div className="w-full flex flex-col items-center">

      {/* ── 1. Hero ── */}
      <section className="w-full max-w-[1240px] px-4 sm:px-6 pt-8 pb-10 flex flex-col items-center text-center">
        {/* Live pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4ff] border border-[#ff6b00]/20 text-[#a04100] text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse"></span>
          <span>General Election 2025 · Student Council</span>
          <span className="text-[#8e7164]">·</span>
          <span className="font-mono text-[#0d1c2e] font-bold">
            {formatTimer(electionState.timeRemainingSeconds)} left
          </span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#0d1c2e] tracking-tight max-w-3xl leading-[1.1]">
          Your Vote,{' '}
          <span className="bg-gradient-to-r from-[#ff6b00] to-[#f77214] bg-clip-text text-transparent">
            Simple &amp; Counted.
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#565e74] max-w-xl leading-relaxed">
          A minimal, accessible e-voting platform for collegiate students, department officers, and election commissioners.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => goTo('login-gateway')}
            className="px-7 py-3.5 rounded-full bg-[#ff6b00] hover:bg-[#a04100] text-white font-bold text-sm shadow-[0_6px_20px_rgba(255,107,0,0.35)] transition-all cursor-pointer flex items-center gap-2 group active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            <span>Sign In to Vote</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>

          <button
            onClick={() => goTo('admin-portal')}
            className="px-5 py-3.5 rounded-full bg-white hover:bg-[#eff4ff] text-[#0d1c2e] border border-slate-200/80 font-semibold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg text-[#565e74]">monitoring</span>
            <span>Live Results</span>
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-10 w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {[
            { label: 'Ballots Cast', value: electionState.ballotsCast.toLocaleString(), sub: `of ${electionState.totalElectors.toLocaleString()} eligible` },
            { label: 'Campus Turnout', value: `${turnoutPercentage}%`, sub: 'Quorum met (50%)', highlight: true },
            { label: 'Departments', value: `${departments.length}`, sub: '100% online' },
            { label: 'Open Races', value: `${races.length}`, sub: 'Council posts' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-[#8e7164] uppercase tracking-wider mb-1">{stat.label}</span>
              <span className={`font-display font-bold text-2xl sm:text-3xl ${stat.highlight ? 'text-[#a04100]' : 'text-[#0d1c2e]'}`}>
                {stat.value}
              </span>
              <span className="text-[11px] text-[#565e74] mt-0.5">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Role Feature Cards ── */}
      <section className="w-full max-w-[1240px] px-4 sm:px-6 py-8">
        <div className="text-center mb-7">
          <span className="text-xs font-bold text-[#ff6b00] tracking-wider uppercase">Who uses CampusVote?</span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0d1c2e] mt-1">
            Built for Every Role
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Student Voter */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-[0_8px_30px_rgba(255,107,0,0.1)] hover:border-[#ff6b00]/30 transition-all flex flex-col gap-4 group">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ff6b00]/10 text-[#a04100] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <span className="material-symbols-outlined text-xl">how_to_vote</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8e7164]">Students</span>
                <h3 className="font-display font-bold text-base text-[#0d1c2e]">Voter Booth</h3>
              </div>
            </div>
            <p className="text-xs text-[#565e74] leading-relaxed">
              Browse candidates, evaluate platforms, and cast your secure ballot in under 2 minutes.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-[#0d1c2e]">
              {['Anonymous secret ballot', 'Candidate platforms', 'Instant confirmation'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ff6b00] text-sm shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => goTo('login-gateway')}
              className="mt-auto w-full py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#ff6b00] hover:text-white text-[#0d1c2e] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Sign In to Vote
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Candidate */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col gap-4 group">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <span className="material-symbols-outlined text-xl">campaign</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8e7164]">Nominees</span>
                <h3 className="font-display font-bold text-base text-[#0d1c2e]">Candidate Hub</h3>
              </div>
            </div>
            <p className="text-xs text-[#565e74] leading-relaxed">
              Inspect live election standing, vote tally percentages, and post campaign platform updates.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-[#0d1c2e]">
              {['Live race rank & tallies', 'College turnout breakdown', 'Campaign feed updates'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-600 text-sm shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => goTo('candidate-dashboard')}
              className="mt-auto w-full py-2.5 rounded-full bg-[#eff4ff] hover:bg-purple-600 hover:text-white text-[#0d1c2e] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Candidate View
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Department Officer */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col gap-4 group">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <span className="material-symbols-outlined text-xl">domain_verification</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8e7164]">Officers</span>
                <h3 className="font-display font-bold text-base text-[#0d1c2e]">Officer Terminal</h3>
              </div>
            </div>
            <p className="text-xs text-[#565e74] leading-relaxed">
              Enroll voters and candidates with auto Student IDs according to their department or classes.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-[#0d1c2e]">
              {['Add voters with Student IDs', 'Nominate dept candidates', 'Voted / Pending status'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-sm shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => goTo('login-gateway')}
              className="mt-auto w-full py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#233144] hover:text-white text-[#0d1c2e] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Officer Login
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Admin */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col gap-4 group">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8e7164]">Administration</span>
                <h3 className="font-display font-bold text-base text-[#0d1c2e]">Admin Center</h3>
              </div>
            </div>
            <p className="text-xs text-[#565e74] leading-relaxed">
              Manage all workings: pause voting, count ballots, manage full student registry & candidates.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-[#0d1c2e]">
              {['Complete workings control', 'Full student & candidate registry', 'Tally & publish results'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-sm shrink-0">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => goTo('login-gateway')}
              className="mt-auto w-full py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#233144] hover:text-white text-[#0d1c2e] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Admin Login
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Live Races Snapshot ── */}
      <section className="w-full max-w-[1240px] px-4 sm:px-6 py-8 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0d1c2e]">Current Races</h2>
            <p className="text-xs text-[#565e74]">Live vote counts — sign in to cast your ballot</p>
          </div>
          <button
            onClick={() => goTo('login-gateway')}
            className="text-xs font-bold text-[#ff6b00] hover:text-[#a04100] flex items-center gap-1 cursor-pointer"
          >
            Vote Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {races.slice(0, 2).map(race => (
            <div key={race.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#8e7164]">Race #{race.code}</span>
                  <h3 className="font-display font-bold text-base text-[#0d1c2e]">{race.title}</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#565e74]">
                  {race.totalVotes.toLocaleString()} votes
                </span>
              </div>

              <div className="space-y-2">
                {race.candidates.slice(0, 3).map(cand => {
                  const pct = race.totalVotes > 0 ? Math.round((cand.votes / race.totalVotes) * 100) : 0;
                  return (
                    <div key={cand.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#eff4ff]/60">
                      <img src={cand.photoUrl} alt={cand.name}
                        className="w-8 h-8 rounded-full object-cover border border-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0d1c2e] truncate">{cand.name}</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div className="bg-[#ff6b00] h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#a04100] shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => goTo('login-gateway')}
                className="w-full py-2 rounded-full bg-[#eff4ff] hover:bg-[#ff6b00] hover:text-white text-xs font-bold text-[#0d1c2e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Sign In to Vote in This Race
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
