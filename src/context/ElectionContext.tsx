import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenType,
  UserProfile,
  UserRole,
  CouncilRace,
  DepartmentTurnout,
  AuditLogItem,
  ElectionState,
  BallotSubmission,
  RegisteredStudent,
  Candidate,
} from '../types/election';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_RACES,
  INITIAL_AUDIT_LOGS,
  DEMO_USERS,
  MOCK_STUDENTS_REGISTRY,
} from '../data/mockData';

interface ToastState {
  message: string;
  icon: string;
  visible: boolean;
}

interface ElectionContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUser: (userId: string) => void;
  electionState: ElectionState;
  departments: DepartmentTurnout[];
  addDepartment: (code: string, name: string, eligible: number) => void;
  removeDepartment: (code: string) => void;
  races: CouncilRace[];
  setRaces: React.Dispatch<React.SetStateAction<CouncilRace[]>>;
  auditLogs: AuditLogItem[];
  myBallot: BallotSubmission | null;
  students: RegisteredStudent[];
  addStudent: (name: string, dept: string, year: string) => { studentId: string; password: string };
  removeStudent: (studentId: string) => void;
  addCandidateToRace: (raceId: string, candidate: Omit<Candidate, 'id' | 'votes'>) => void;
  removeCandidateFromRace: (raceId: string, candidateId: string) => void;
  toggleVotingState: () => void;
  concludeAndLock: () => void;
  setElectionTallied: () => void;
  publishCertifiedResults: () => void;
  downloadAuditTrail: () => void;
  castBallot: (selections: Record<string, string>) => Promise<BallotSubmission>;
  injectSimulatedLog: () => void;
  toast: ToastState;
  showToast: (msg: string, icon?: string) => void;
  isTallyModalOpen: boolean;
  setIsTallyModalOpen: (open: boolean) => void;
  selectedRaceForDetail: CouncilRace | null;
  setSelectedRaceForDetail: (race: CouncilRace | null) => void;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

// Auto-generate student IDs
let nextStudentNum = 1000;
const generateStudentId = () => {
  nextStudentNum += Math.floor(Math.random() * 9) + 1;
  return `STU-${nextStudentNum}`;
};

// Auto-generate secure passwords
const generatePassword = (name: string) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const firstName = name.split(' ')[0].toLowerCase();
  return `${firstName}@${suffix}`;
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [departments, setDepartments] = useState<DepartmentTurnout[]>(INITIAL_DEPARTMENTS);
  const [races, setRaces] = useState<CouncilRace[]>(INITIAL_RACES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [myBallot, setMyBallot] = useState<BallotSubmission | null>(null);
  const [students, setStudents] = useState<RegisteredStudent[]>(MOCK_STUDENTS_REGISTRY);

  const [electionState, setElectionState] = useState<ElectionState>({
    status: 'active',
    activePhase: 3,
    timeRemainingSeconds: 14 * 3600 + 28 * 60 + 9,
    totalElectors: 14850,
    ballotsCast: 10158,
    quorumBaselinePct: 50.0,
    anomaliesCount: 0,
    isPaused: false,
    isLocked: false,
    isTallied: false,
    isPublished: false,
  });

  const [toast, setToast] = useState<ToastState>({
    message: '',
    icon: 'info',
    visible: false,
  });

  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [selectedRaceForDetail, setSelectedRaceForDetail] = useState<CouncilRace | null>(null);

  // Countdown timer
  useEffect(() => {
    if (electionState.isLocked || electionState.isPaused) return;
    const timer = setInterval(() => {
      setElectionState(prev => ({
        ...prev,
        timeRemainingSeconds: Math.max(0, prev.timeRemainingSeconds - 1),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [electionState.isLocked, electionState.isPaused]);

  const showToast = (message: string, icon = 'info') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3800);
  };

  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  // ── Add a new student voter ──
  const addStudent = (name: string, dept: string, year: string): { studentId: string; password: string } => {
    const studentId = generateStudentId();
    const password = generatePassword(name);
    const newStudent: RegisteredStudent = {
      studentId,
      name,
      dept,
      year,
      password,
      hasVoted: false,
      time: '',
    };
    setStudents(prev => [...prev, newStudent]);

    // Update department eligible count
    setDepartments(prev =>
      prev.map(d => {
        if (d.code === dept) {
          const newEligible = d.eligible + 1;
          return { ...d, eligible: newEligible, turnoutPct: parseFloat(((d.voted / newEligible) * 100).toFixed(1)) };
        }
        return d;
      })
    );

    // Update total electors
    setElectionState(prev => ({ ...prev, totalElectors: prev.totalElectors + 1 }));

    showToast(`Registered ${name} (${studentId}) in ${dept}`, 'person_add');
    return { studentId, password };
  };

  // ── Remove a student voter ──
  const removeStudent = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student) return;
    setStudents(prev => prev.filter(s => s.studentId !== studentId));
    setDepartments(prev =>
      prev.map(d => {
        if (d.code === student.dept) {
          const newEligible = Math.max(0, d.eligible - 1);
          const newVoted = student.hasVoted ? Math.max(0, d.voted - 1) : d.voted;
          return {
            ...d,
            eligible: newEligible,
            voted: newVoted,
            turnoutPct: newEligible > 0 ? parseFloat(((newVoted / newEligible) * 100).toFixed(1)) : 0,
          };
        }
        return d;
      })
    );
    setElectionState(prev => ({
      ...prev,
      totalElectors: Math.max(0, prev.totalElectors - 1),
      ballotsCast: student.hasVoted ? Math.max(0, prev.ballotsCast - 1) : prev.ballotsCast,
    }));
    showToast(`Removed student ${student.name} (${studentId})`, 'person_remove');
  };

  // ── Add a candidate to a race ──
  const addCandidateToRace = (raceId: string, candidate: Omit<Candidate, 'id' | 'votes'>) => {
    const id = `cand-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setRaces(prev =>
      prev.map(race => {
        if (race.id === raceId) {
          return {
            ...race,
            contendingCount: race.contendingCount + 1,
            candidates: [...race.candidates, { ...candidate, id, votes: 0 }],
          };
        }
        return race;
      })
    );
    showToast(`Candidate ${candidate.name} added to race`, 'person_add');
  };

  // ── Remove candidate from race ──
  const removeCandidateFromRace = (raceId: string, candidateId: string) => {
    setRaces(prev =>
      prev.map(race => {
        if (race.id === raceId) {
          const candToRemove = race.candidates.find(c => c.id === candidateId);
          return {
            ...race,
            contendingCount: Math.max(0, race.contendingCount - 1),
            totalVotes: Math.max(0, race.totalVotes - (candToRemove?.votes || 0)),
            candidates: race.candidates.filter(c => c.id !== candidateId),
          };
        }
        return race;
      })
    );
    showToast('Candidate removed from race', 'delete');
  };

  // ── Add Department (Admin) ──
  const addDepartment = (code: string, name: string, eligible: number) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || !name.trim()) {
      showToast('Department code and name required', 'warning');
      return;
    }
    if (departments.some(d => d.code === cleanCode)) {
      showToast(`Department code ${cleanCode} already exists`, 'warning');
      return;
    }
    const quota = Math.max(1, eligible || 500);
    const newDept: DepartmentTurnout = {
      code: cleanCode,
      name: name.trim(),
      lead: 'Department Chair',
      voted: 0,
      eligible: quota,
      turnoutPct: 0,
      status: 'Tamper-Free',
      badgeBg: 'bg-[#eff4ff]',
      badgeText: 'text-[#0d1c2e]',
    };
    setDepartments(prev => [...prev, newDept]);
    setElectionState(prev => ({
      ...prev,
      totalElectors: prev.totalElectors + quota,
    }));
    showToast(`Added Department: ${cleanCode} (${name.trim()})`, 'domain_add');
  };

  // ── Remove Department (Admin) ──
  const removeDepartment = (code: string) => {
    const dept = departments.find(d => d.code === code);
    if (!dept) return;
    setDepartments(prev => prev.filter(d => d.code !== code));
    setElectionState(prev => ({
      ...prev,
      totalElectors: Math.max(0, prev.totalElectors - dept.eligible),
      ballotsCast: Math.max(0, prev.ballotsCast - dept.voted),
    }));
    showToast(`Removed Department: ${code}`, 'domain_disabled');
  };

  const toggleVotingState = () => {
    if (electionState.isLocked) {
      showToast('Election is locked. Cannot change state.', 'error');
      return;
    }
    const nextPaused = !electionState.isPaused;
    setElectionState(prev => ({
      ...prev,
      isPaused: nextPaused,
      status: nextPaused ? 'paused' : 'active',
    }));
    showToast(nextPaused ? 'Voting paused.' : 'Voting resumed.', nextPaused ? 'pause_circle' : 'how_to_vote');
  };

  const concludeAndLock = () => {
    if (electionState.isLocked) return;
    setElectionState(prev => ({
      ...prev,
      isLocked: true,
      isPaused: false,
      status: 'locked',
      activePhase: 4,
    }));
    showToast('Election closed and locked.', 'lock');
  };

  const setElectionTallied = () => {
    setElectionState(prev => ({ ...prev, isTallied: true, status: 'tallied' }));
    showToast('Vote count complete!', 'calculate');
  };

  const publishCertifiedResults = () => {
    if (!electionState.isLocked) {
      showToast('Close the election first before publishing.', 'warning');
      return;
    }
    if (!electionState.isTallied) {
      showToast('Run the vote count before publishing.', 'warning');
      return;
    }
    setElectionState(prev => ({ ...prev, isPublished: true, status: 'published', activePhase: 5 }));
    showToast('Results published!', 'military_tech');
  };

  const downloadAuditTrail = () => {
    showToast('Generating report...', 'download');
    setTimeout(() => {
      const data = {
        election: 'Collegiate General Election 2025',
        timestamp: new Date().toISOString(),
        totalRegistered: electionState.totalElectors,
        totalCast: electionState.ballotsCast,
        turnout: ((electionState.ballotsCast / electionState.totalElectors) * 100).toFixed(2) + '%',
        departments,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CampusVote_Report_2025.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Report downloaded.', 'verified');
    }, 800);
  };

  const injectSimulatedLog = () => {
    const ids = ['STU-1029', 'STU-7731', 'STU-5541', 'STU-9920', 'STU-3301', 'STU-6124'];
    const depts = ['CS', 'ENG', 'BUS', 'ART', 'SCI', 'LAW'];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];

    setElectionState(prev => ({ ...prev, ballotsCast: prev.ballotsCast + 1 }));
    setDepartments(prev =>
      prev.map(d => {
        if (d.code === randomDept) {
          const newVoted = d.voted + 1;
          return { ...d, voted: newVoted, turnoutPct: parseFloat(((newVoted / d.eligible) * 100).toFixed(1)) };
        }
        return d;
      })
    );
    showToast(`Simulated vote from ${randomId} (${randomDept})`, 'sensors');
  };

  const castBallot = async (selections: Record<string, string>): Promise<BallotSubmission> => {
    const studentId = currentUser.studentId || 'STU-9842';
    const dept = currentUser.department.includes('CS') || currentUser.department.includes('Computer') ? 'CS' : 'ENG';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ballotHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const blockNumber = 4820 + Math.floor(Math.random() * 10);
    const merkleProof = 'ZK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const submission: BallotSubmission = {
      studentId,
      timestamp,
      department: dept,
      selections,
      ballotHash,
      blockNumber,
      merkleProof,
    };

    setMyBallot(submission);
    setCurrentUser(prev => ({ ...prev, hasVoted: true }));
    setElectionState(prev => ({ ...prev, ballotsCast: prev.ballotsCast + 1 }));

    // Update department
    setDepartments(prev =>
      prev.map(d => {
        if (d.code === dept) {
          const newVoted = d.voted + 1;
          return { ...d, voted: newVoted, turnoutPct: parseFloat(((newVoted / d.eligible) * 100).toFixed(1)) };
        }
        return d;
      })
    );

    // Update candidate votes
    setRaces(prev =>
      prev.map(race => {
        const selectedCandidateId = selections[race.id];
        if (selectedCandidateId) {
          return {
            ...race,
            totalVotes: race.totalVotes + 1,
            candidates: race.candidates.map(c =>
              c.id === selectedCandidateId ? { ...c, votes: c.votes + 1 } : c
            ),
          };
        }
        return race;
      })
    );

    // Mark student as voted
    setStudents(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? { ...s, hasVoted: true, time: timestamp }
          : s
      )
    );

    return submission;
  };

  return (
    <ElectionContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        currentUser,
        setCurrentUser,
        switchUser,
        electionState,
        departments,
        addDepartment,
        removeDepartment,
        races,
        setRaces,
        auditLogs,
        myBallot,
        students,
        addStudent,
        removeStudent,
        addCandidateToRace,
        removeCandidateFromRace,
        toggleVotingState,
        concludeAndLock,
        setElectionTallied,
        publishCertifiedResults,
        downloadAuditTrail,
        castBallot,
        injectSimulatedLog,
        toast,
        showToast,
        isTallyModalOpen,
        setIsTallyModalOpen,
        selectedRaceForDetail,
        setSelectedRaceForDetail,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = (): ElectionContextType => {
  const context = useContext(ElectionContext);
  if (!context) {
    return {
      currentScreen: 'overview',
      setCurrentScreen: () => {},
      currentUser: DEMO_USERS[0],
      setCurrentUser: () => {},
      switchUser: () => {},
      electionState: {
        status: 'active',
        activePhase: 3,
        timeRemainingSeconds: 14 * 3600,
        totalElectors: 14850,
        ballotsCast: 10158,
        quorumBaselinePct: 50,
        anomaliesCount: 0,
        isPaused: false,
        isLocked: false,
        isTallied: false,
        isPublished: false,
      },
      departments: INITIAL_DEPARTMENTS,
      addDepartment: () => {},
      removeDepartment: () => {},
      races: INITIAL_RACES,
      setRaces: () => {},
      auditLogs: INITIAL_AUDIT_LOGS,
      myBallot: null,
      students: MOCK_STUDENTS_REGISTRY,
      addStudent: () => ({ studentId: 'STU-1000', password: 'temp@1234' }),
      removeStudent: () => {},
      addCandidateToRace: () => {},
      removeCandidateFromRace: () => {},
      toggleVotingState: () => {},
      concludeAndLock: () => {},
      setElectionTallied: () => {},
      publishCertifiedResults: () => {},
      downloadAuditTrail: () => {},
      castBallot: async () => ({
        studentId: 'STU-9842',
        timestamp: '',
        department: 'CS',
        selections: {},
        ballotHash: '',
        blockNumber: 0,
        merkleProof: '',
      }),
      injectSimulatedLog: () => {},
      toast: { message: '', icon: 'info', visible: false },
      showToast: () => {},
      isTallyModalOpen: false,
      setIsTallyModalOpen: () => {},
      selectedRaceForDetail: null,
      setSelectedRaceForDetail: () => {},
    };
  }
  return context;
};
