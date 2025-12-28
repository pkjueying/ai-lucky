import React, { useState, useEffect, useCallback } from 'react';
import { Participant, Winner } from '../types';
import { shuffleArray, exportToCSV } from '../utils/dataHelper';
import { saveActivity } from '../utils/storageHelper';
import { Button } from './Button';
import { generateCongratulation } from '../services/geminiService';
import { Trophy, Download, RotateCcw, Sparkles, StopCircle, Play, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyDrawProps {
  participants: Participant[];
}

export const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('???');
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  const [prizeName, setPrizeName] = useState('一等奖');
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Filter pool based on repeat logic
  const getPool = useCallback(() => {
    if (allowRepeat) return participants;
    const winnerIds = new Set(winners.map(w => w.id));
    return participants.filter(p => !winnerIds.has(p.id));
  }, [participants, winners, allowRepeat]);

  const pool = getPool();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSpinning && pool.length > 0) {
      interval = setInterval(() => {
        const randomIdx = Math.floor(Math.random() * pool.length);
        setCurrentDisplay(pool[randomIdx].name);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isSpinning, pool]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const startDraw = () => {
    if (pool.length === 0) {
      alert('奖池已空！请先添加名单或重置抽奖。');
      return;
    }
    setIsSpinning(true);
    setAiMessage(null);
  };

  const stopDraw = async () => {
    setIsSpinning(false);
    triggerConfetti();
    
    // Pick winners
    const shuffled = shuffleArray<Participant>(pool);
    const selected = shuffled.slice(0, Math.min(drawCount, pool.length));
    
    const newWinners: Winner[] = selected.map(p => ({
      ...p,
      wonAt: new Date().toISOString(),
      prize: prizeName
    }));

    setWinners(prev => [...newWinners, ...prev]);
    setCurrentDisplay(selected.length === 1 ? selected[0].name : '完成!');

    // Save to History
    saveActivity({
      type: 'LUCKY_DRAW',
      title: `${prizeName} (x${selected.length})`,
      details: `中奖名单: ${selected.map(w => w.name).join(', ')}`,
      data: newWinners
    });

    // AI Bonus for single winner
    if (selected.length === 1) {
        const msg = await generateCongratulation(selected[0].name, prizeName);
        setAiMessage(msg);
    }
  };

  const handleExport = () => {
    const data = winners.map(w => ({
      ID: w.id,
      姓名: w.name,
      奖项: w.prize,
      时间: new Date(w.wonAt).toLocaleString()
    }));
    exportToCSV(data, '中奖名单');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      {/* Tech Container */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black opacity-80 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* Left: Control Panel (Glassmorphism) */}
            <div className="md:w-80 flex-shrink-0 flex flex-col gap-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
                <div className="flex items-center text-cyan-400 mb-2">
                    <Settings className="w-5 h-5 mr-2" />
                    <h3 className="font-bold tracking-wide text-sm">抽奖设置</h3>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">奖项名称</label>
                    <input 
                        type="text" 
                        value={prizeName} 
                        onChange={(e) => setPrizeName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 text-white border border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-500 font-medium"
                        placeholder="例如：一等奖"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">单次抽取人数</label>
                    <div className="relative">
                        <select 
                            value={drawCount} 
                            onChange={(e) => setDrawCount(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-slate-800/50 text-white border border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none appearance-none cursor-pointer transition-all font-medium"
                        >
                            {[1, 2, 3, 5, 10, 20, 50].map(n => <option key={n} value={n} className="bg-slate-800">{n} 人 / 次</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center p-3 bg-slate-800/30 rounded-lg border border-white/5">
                    <input 
                        type="checkbox" 
                        id="repeat" 
                        checked={allowRepeat} 
                        onChange={(e) => setAllowRepeat(e.target.checked)}
                        className="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-500 bg-slate-700 border-slate-600 cursor-pointer"
                    />
                    <label htmlFor="repeat" className="ml-3 text-sm text-slate-300 cursor-pointer select-none">允许重复中奖</label>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>当前奖池</span>
                         <span className="text-cyan-400 font-mono text-lg font-bold">{pool.length} 人</span>
                     </div>
                </div>
            </div>

            {/* Right: Stage Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Main Display */}
                <div className="relative w-full max-w-2xl aspect-video flex items-center justify-center mb-8">
                     <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                     
                     <div className="relative w-full h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl overflow-hidden">
                        
                        {/* Status Indicator */}
                        <div className="absolute top-4 right-6 flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${isSpinning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                             <span className="text-xs text-slate-400 font-mono">{isSpinning ? '抽奖中...' : '待机'}</span>
                        </div>

                        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-blue-200 text-center drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] ${isSpinning ? 'slot-machine-text' : ''}`}>
                            {isSpinning ? currentDisplay : (winners.length > 0 && currentDisplay !== '完成!' ? currentDisplay : (winners.length > 0 ? '恭喜!' : '准备'))}
                        </h1>

                        {!isSpinning && winners.length > 0 && currentDisplay === '完成!' && (
                            <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4">
                                <p className="text-slate-400 text-sm mb-2">最新中奖</p>
                                <div className="text-2xl md:text-3xl font-bold text-cyan-300 drop-shadow-md">
                                    {winners.slice(0, drawCount).map(w => w.name).join(', ')}
                                </div>
                            </div>
                        )}

                        {aiMessage && (
                             <div className="absolute bottom-4 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 text-yellow-300 text-sm flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-2">
                                <Sparkles size={14} />
                                <span>{aiMessage}</span>
                             </div>
                        )}
                     </div>
                </div>

                {/* Actions */}
                <div className="flex gap-6">
                    {!isSpinning ? (
                    <button 
                        onClick={startDraw}
                        disabled={pool.length === 0}
                        className="relative group px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xl rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span className="flex items-center relative z-10"><Play className="fill-current w-6 h-6 mr-2" /> 开始抽奖</span>
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
                    </button>
                    ) : (
                    <button 
                        onClick={stopDraw}
                        className="relative group px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-xl rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="flex items-center relative z-10"><StopCircle className="fill-current w-6 h-6 mr-2" /> 停止!</span>
                    </button>
                    )}
                </div>

            </div>
        </div>
      </div>

      {/* Winners List (Clean & Modern) */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="font-bold text-slate-200 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            中奖名单记录
          </h3>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setWinners([])} className="text-xs h-8 bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
              <RotateCcw className="w-3 h-3 mr-1" /> 清空
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={winners.length === 0} className="text-xs h-8 border-slate-600 text-blue-400 hover:bg-slate-800">
              <Download className="w-3 h-3 mr-1" /> 导出CSV
            </Button>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">序号</th>
                <th className="px-6 py-3">姓名</th>
                <th className="px-6 py-3">奖项</th>
                <th className="px-6 py-3">中奖时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {winners.map((winner, index) => (
                <tr key={index} className="bg-slate-900 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-slate-500">{winners.length - index}</td>
                  <td className="px-6 py-3 font-bold text-slate-200">{winner.name}</td>
                  <td className="px-6 py-3">
                    <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-500/30">
                      {winner.prize}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{new Date(winner.wonAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-600 italic">
                    暂无中奖数据...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};