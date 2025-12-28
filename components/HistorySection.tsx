import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { getHistory, clearHistory, deleteActivity } from '../utils/storageHelper';
import { Button } from './Button';
import { Clock, Search, Trash2, FileJson } from 'lucide-react';
import { exportToCSV } from '../utils/dataHelper';

export const HistorySection: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLogs(getHistory());
  }, []);

  const handleClearAll = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setLogs([]); // Directly update state
    }
  };

  const handleDeleteItem = (id: string) => {
    if(confirm('确定删除这条记录吗？')) {
        const updated = deleteActivity(id);
        setLogs(updated); // Update state with the returned list
    }
  }

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadLog = (log: ActivityLog) => {
      if (log.type === 'LUCKY_DRAW') {
          exportToCSV(log.data, `历史记录_抽奖_${log.timestamp}`);
      } else if (log.type === 'GROUPING') {
          const flatData = log.data.flatMap((g: any) => 
            g.members.map((m: any) => ({
                组ID: g.id,
                组名: g.name,
                成员姓名: m.name
            }))
          );
          exportToCSV(flatData, `历史记录_分组_${log.timestamp}`);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-500" />
            活动记录
          </h2>
          <p className="text-slate-400 text-sm mt-1">查看之前的抽奖和分组结果</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="搜索记录..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-slate-500"
            />
          </div>
          {logs.length > 0 && (
            <Button variant="danger" onClick={handleClearAll} className="whitespace-nowrap bg-red-900 hover:bg-red-800 border border-red-800">
              <Trash2 className="w-4 h-4 mr-2" /> 清空所有
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无历史记录</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    log.type === 'LUCKY_DRAW' 
                      ? 'bg-amber-900/30 text-amber-200 border border-amber-900/50' 
                      : 'bg-indigo-900/30 text-indigo-200 border border-indigo-900/50'
                  }`}>
                    {log.type === 'LUCKY_DRAW' ? '抽奖' : '分组'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 text-lg">{log.title}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{log.details}</p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 items-center">
                 <Button variant="secondary" size="sm" onClick={() => downloadLog(log)} className="text-xs bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
                    <FileJson className="w-4 h-4 mr-1" /> 导出
                 </Button>
                 <button 
                    onClick={() => handleDeleteItem(log.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                    title="删除记录"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};