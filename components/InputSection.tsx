import React, { useState, useRef, useMemo } from 'react';
import { Participant } from '../types';
import { parseNames, generateId, shuffleArray } from '../utils/dataHelper';
import { Button } from './Button';
import { Upload, FileText, Trash2, CheckCircle, Users, Wand2, AlertTriangle, CopyMinus, X } from 'lucide-react';

interface InputSectionProps {
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
}

const CHINESE_NAMES_POOL = [
  "李明", "王伟", "张秀英", "刘洋", "陈静", "杨勇", "赵丽", "黄强", 
  "周杰", "吴刚", "孙楠", "朱丽", "马超", "胡婷", "林峰", "郭磊", 
  "何颖", "高健", "罗娜", "郑伟", "韩雪", "唐明", "冯军", "谢娜", 
  "董涛", "梁静", "宋杰", "杜鹃", "曹勇", "魏强", "苏珊", "叶平",
  "徐凯", "潘婷", "袁浩", "于敏", "蒋涛", "蔡红", "贾亮", "丁宁"
];

export const InputSection: React.FC<InputSectionProps> = ({ participants, setParticipants }) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate duplicates for display
  const nameCounts = useMemo(() => {
    return participants.reduce((acc, p) => {
      acc[p.name] = (acc[p.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [participants]);

  const hasDuplicates = Object.values(nameCounts).some((count) => (count as number) > 1);

  const handleParse = () => {
    if (!inputText.trim()) return;
    const newParticipants = parseNames(inputText);
    setParticipants([...participants, ...newParticipants]);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newParticipants = parseNames(text);
        setParticipants([...participants, ...newParticipants]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadRandomDemoData = () => {
    // Pick 5 random names from the pool
    const shuffled = shuffleArray([...CHINESE_NAMES_POOL]);
    const selectedNames = shuffled.slice(0, 5);
    
    const demoParticipants = selectedNames.map(name => ({
      id: generateId(),
      name
    }));
    setParticipants([...participants, ...demoParticipants]);
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      if (seen.has(p.name)) {
        return false;
      }
      seen.add(p.name);
      return true;
    });
    setParticipants(uniqueParticipants);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const clearAll = () => {
    // Simple window confirm works in most cases, ensure state update is called
    if (window.confirm('确认清空所有名单吗？此操作不可恢复。')) {
      setParticipants([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Input Area */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-500" />
              导入名单
            </h2>
            <button 
              onClick={loadRandomDemoData}
              className="text-xs text-blue-300 hover:text-blue-100 flex items-center font-medium bg-blue-900/30 border border-blue-800 px-2 py-1 rounded-lg transition-colors"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              随机添加5人
            </button>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                粘贴姓名 (每行一个或逗号分隔)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 p-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder-slate-500"
                placeholder="张三&#10;李四&#10;王五, 赵六"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleParse} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-none">
                添加名单
              </Button>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()} 
                    icon={<FileText size={16} />}
                    className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                >
                  上传 CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col h-[500px]">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                当前名单 ({participants.length})
              </h2>
              {participants.length > 0 && (
                <button 
                    onClick={clearAll} 
                    className="flex items-center px-3 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> 清空
                </button>
              )}
            </div>
            
            {hasDuplicates && (
              <div className="flex items-center justify-between bg-orange-900/20 border border-orange-900/50 rounded-lg p-2 text-sm text-orange-200 animate-in slide-in-from-top-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                  <span>发现重复姓名</span>
                </div>
                <button 
                  onClick={removeDuplicates}
                  className="text-xs bg-orange-900/40 border border-orange-700 px-2 py-1 rounded hover:bg-orange-800 font-medium flex items-center transition-colors text-orange-100"
                >
                  <CopyMinus className="w-3 h-3 mr-1" />
                  去重
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            {participants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Users className="w-12 h-12 mb-2 opacity-30" />
                <p>暂无人员数据</p>
                <p className="text-xs mt-2">请左侧输入或点击"随机添加"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {participants.map((p, idx) => {
                  const isDuplicate = nameCounts[p.name] > 1;
                  return (
                    <div 
                      key={p.id} 
                      className={`group relative px-3 py-2 rounded-lg border text-sm flex items-center shadow-sm transition-colors ${
                        isDuplicate 
                          ? 'bg-orange-900/20 border-orange-800/50' 
                          : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2 font-bold ${
                         isDuplicate ? 'bg-orange-900 text-orange-200' : 'bg-blue-900 text-blue-200'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`truncate flex-1 ${isDuplicate ? 'text-orange-200 font-medium' : 'text-slate-300'}`}>
                        {p.name}
                      </span>
                      {isDuplicate && <AlertTriangle className="w-3 h-3 text-orange-500 ml-1" />}
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => removeParticipant(p.id)}
                        className="ml-2 p-1 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="删除"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};