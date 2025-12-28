import { Users, Trophy, Shuffle, History } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'INPUT', label: '名单管理', icon: Users, description: '导入与编辑' },
  { id: 'LUCKY_DRAW', label: '幸运抽奖', icon: Trophy, description: '随机抽取奖项' },
  { id: 'TEAM_BUILDER', label: '自动分组', icon: Shuffle, description: '团队随机分配' },
  { id: 'HISTORY', label: '活动记录', icon: History, description: '查看历史数据' },
];

export const COLORS = [
  'bg-blue-900/40 border-blue-700 text-blue-100',
  'bg-emerald-900/40 border-emerald-700 text-emerald-100',
  'bg-purple-900/40 border-purple-700 text-purple-100',
  'bg-orange-900/40 border-orange-700 text-orange-100',
  'bg-pink-900/40 border-pink-700 text-pink-100',
  'bg-indigo-900/40 border-indigo-700 text-indigo-100',
  'bg-teal-900/40 border-teal-700 text-teal-100',
  'bg-rose-900/40 border-rose-700 text-rose-100',
];