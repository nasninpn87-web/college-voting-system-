export type ScreenType = 'overview' | 'login-gateway' | 'registration' | 'student-voter-candidate-booth' | 'department-officer' | 'admin-portal' | 'candidate-dashboard';

export type UserRole = 'super-admin' | 'student-voter' | 'department-officer' | 'candidate' | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  roleTitle: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  studentId?: string;
  hasVoted?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  slate: string;
  partyColor: string;
  major: string;
  year: string;
  gpa: string;
  photoUrl: string;
  tagline: string;
  bio: string;
  policyPillars: string[];
  endorsements: string[];
  votes: number;
  dept?: string; // department that registered this candidate
}

export interface CouncilRace {
  id: string;
  code: string;
  title: string;
  description: string;
  contendingCount: number;
  totalVotes: number;
  candidates: Candidate[];
}

export interface DepartmentTurnout {
  code: string;
  name: string;
  lead: string;
  voted: number;
  eligible: number;
  turnoutPct: number;
  status: 'Tamper-Free' | 'Audited' | 'Flagged';
  badgeBg: string;
  badgeText: string;
}

export interface RegisteredStudent {
  studentId: string;
  name: string;
  dept: string;
  year: string;
  password: string;
  hasVoted: boolean;
  time: string;
}

export interface AuditLogItem {
  id: string;
  type: 'token_sealed' | 'double_vote_blocked' | 'candidate_endorsement' | 'quorum_shard' | 'circuit_breaker' | 'tally_computed';
  title: string;
  timestamp: string;
  details: string;
  studentId?: string;
  dept?: string;
  hash?: string;
  isWarning?: boolean;
}

export interface ElectionState {
  status: 'active' | 'paused' | 'locked' | 'tallied' | 'published';
  activePhase: number;
  timeRemainingSeconds: number;
  totalElectors: number;
  ballotsCast: number;
  quorumBaselinePct: number;
  anomaliesCount: number;
  isPaused: boolean;
  isLocked: boolean;
  isTallied: boolean;
  isPublished: boolean;
}

export interface BallotSubmission {
  studentId: string;
  timestamp: string;
  department: string;
  selections: Record<string, string>;
  ballotHash: string;
  blockNumber: number;
  merkleProof: string;
}
