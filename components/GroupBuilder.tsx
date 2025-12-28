import React, { useState } from 'react';
import { Participant, Group } from '../types';
import { shuffleArray, exportToCSV } from '../utils/dataHelper';
import { saveActivity } from '../utils/storageHelper';
import { Button } from './Button';
import { generateCreativeTeamName } from '../services/geminiService';
import { COLORS } from '../constants';
import { Shuffle, Download, Users, Wand2, Grid3X3 } from 'lucide-react';

interface GroupBuilderProps {
  participants: Participant[];
}

export const GroupBuilder: React.FC<GroupBuilderProps> = ({ participants }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(4);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const generateGroups = () => {
    if (participants.length === 0) return;
    
    const shuffled = shuffleArray<Participant>(participants);
    const newGroups: Group[] = [];
    const totalGroups = Math.ceil(shuffled.length / groupSize);

    for (let i = 0; i < totalGroups; i++) {
      const members = shuffled.slice(i * groupSize, (i + 1) * groupSize);
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${i + 1} 组`,
        members
      });
    }
    setGroups(newGroups);

    saveActivity({
        type: 'GROUPING',
        title: `分组完成: ${participants.length} 人`,
        details: `共 ${newGroups.length} 组 (每组约 ${groupSize} 人)`,
        data: newGroups
    });
  };

  const handleAiName = async (groupId: string, members: string[]) => {
    setLoadingAI(groupId);
    const newName = await generateCreativeTeamName(members);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
    setLoadingAI(null);
  };

  const exportGroups = () => {
    const flatData = groups.flatMap(g => 
      g.members.map(m => ({
        组ID: g.id,
        组名: g.name,
        成员ID: m.id,
        成员姓名: m.name
      }))
    );
    exportToCSV(flatData, '分组名单');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Configuration Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-indigo-800 p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-bold flex items-center mb-2">
             <Grid3X3 className="w-8 h-8 mr-3 text-indigo-400" />
             自动分组助手
           </h2>
           <p className="text-indigo-200 opacity-80 max-w-md text-sm">
             将 {participants.length} 名参与者随机分配到不同的小组中。支持 AI 生成趣味队名。
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-white/10">
           <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-300">每组人数:</span>
             <input 
               type="number" 
               min={1}
               max={participants.length || 10}
               value={groupSize} 
               onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))}
               className="w-20 px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-center"
             />
           </div>
           
           <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

           <Button onClick={generateGroups} disabled={participants.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-none">
             <Shuffle size={16} className="mr-2" /> 生成分组
           </Button>

           {groups.length > 0 && (
              <Button variant="secondary" onClick={exportGroups} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700">
                <Download size={16} />
              </Button>
           )}
        </div>
      </div>

      {/* Visual Display */}
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group, idx) => (
            <div 
              key={group.id} 
              className={`rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group-card bg-slate-900/50 border-slate-800 backdrop-blur-sm`}
            >
              {/* Card Header */}
              <div className={`-mx-5 -mt-5 p-4 mb-4 flex justify-between items-center border-b border-white/5 ${COLORS[idx % COLORS.length]}`}>
                <h3 className="font-bold text-lg truncate flex-1 text-white" title={group.name}>
                    {group.name}
                </h3>
                <button 
                  onClick={() => handleAiName(group.id, group.members.map(m => m.name))}
                  disabled={!!loadingAI}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors shadow-sm"
                  title="AI 生成队名"
                >
                  {loadingAI === group.id ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Wand2 size={16} />}
                </button>
              </div>
              
              {/* Member List */}
              <ul className="space-y-2">
                {group.members.map(member => (
                  <li key={member.id} className="flex items-center text-sm font-medium text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs mr-3 font-mono">
                         {member.name.charAt(0).toUpperCase()}
                    </div>
                    {member.name}
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
                 <span>第 {idx + 1} 组</span>
                 <span>{group.members.length} 人</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 opacity-40 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-400">准备好分组了吗？</p>
          <p className="text-sm mt-1 opacity-60">请在上方调整设置并点击生成</p>
        </div>
      )}
    </div>
  );
};