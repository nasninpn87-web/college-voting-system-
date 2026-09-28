import React from 'react';
import { ElectionProvider, useElection } from './context/ElectionContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeOverview } from './components/home/HomeOverview';
import { AdminPortal } from './components/admin/AdminPortal';
import { VoterBooth } from './components/voter/VoterBooth';
import { DepartmentOfficer } from './components/officer/DepartmentOfficer';
import { LoginGateway } from './components/auth/LoginGateway';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';

const AppContent: React.FC = () => {
  const { currentScreen, toast } = useElection();

  return (
    <div className="relative min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col font-sans selection:bg-[#ffdbcc] selection:text-[#351000]">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#ff6b00]/8 blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#f77214]/8 blur-[120px]"></div>
      </div>

      <Header />

      <main className="relative z-10 w-full pt-16 bg-[#f8f9ff] min-h-[calc(100vh-64px)] flex-1">
        {currentScreen === 'overview' && <HomeOverview />}
        {currentScreen === 'admin-portal' && <AdminPortal />}
        {currentScreen === 'student-voter-candidate-booth' && <VoterBooth />}
        {currentScreen === 'department-officer' && <DepartmentOfficer />}
        {currentScreen === 'candidate-dashboard' && <CandidateDashboard />}
        {currentScreen === 'login-gateway' && <LoginGateway />}
      </main>

      <Footer />

      {/* Toast notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 rounded-full bg-[#233144] text-[#eaf1ff] px-5 py-3 shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
          toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 pointer-events-none scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[#ff6b00] text-lg">
          {toast.icon || 'info'}
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ElectionProvider>
      <AppContent />
    </ElectionProvider>
  );
}
