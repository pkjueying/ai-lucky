import React, { useState } from 'react';
import { Participant, AppMode } from './types';
import { NAV_ITEMS } from './constants';
import { InputSection } from './components/InputSection';
import { LuckyDraw } from './components/LuckyDraw';
import { GroupBuilder } from './components/GroupBuilder';
import { HistorySection } from './components/HistorySection';
import { Briefcase } from 'lucide-react';

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.INPUT);

  const renderContent = () => {
    switch (mode) {
      case AppMode.INPUT:
        return <InputSection participants={participants} setParticipants={setParticipants} />;
      case AppMode.LUCKY_DRAW:
        return <LuckyDraw participants={participants} />;
      case AppMode.TEAM_BUILDER:
        return <GroupBuilder participants={participants} />;
      case AppMode.HISTORY:
        return <HistorySection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
           <div className="bg-blue-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-blue-500/20">
             <Briefcase className="w-6 h-6 text-white" />
           </div>
           <span className="hidden lg:block font-bold text-white text-lg tracking-wide">人事抽奖助手</span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as AppMode)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none" />}
                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                <div className="hidden lg:block ml-3 text-left relative z-10">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>{item.description}</div>
                </div>
                {item.id === 'INPUT' && (
                  <span className={`lg:ml-auto ml-1 text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center relative z-10 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {participants.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 hidden lg:block">
            <div className="text-xs text-slate-500 text-center">
                智能 HR 工具箱 v2.0
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center px-8 shadow-sm justify-between z-10">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
            {NAV_ITEMS.find(n => n.id === mode)?.label}
          </h1>
          <div className="text-sm font-medium px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${participants.length > 0 ? 'bg-emerald-500 text-emerald-500' : 'bg-slate-500 text-slate-500'}`}></span>
             当前名单人数: <span className="text-white font-mono">{participants.length}</span>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
             {/* Gradient Background Effect */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none -z-10"></div>
             {renderContent()}
        </div>
      </main>

    </div>
  );
}