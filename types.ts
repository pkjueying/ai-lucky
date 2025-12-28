export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export interface Winner extends Participant {
  wonAt: string; // ISO Date string
  prize?: string;
}

export interface ActivityLog {
  id: string;
  type: 'LUCKY_DRAW' | 'GROUPING';
  timestamp: string;
  title: string;
  details: string; // Summary text
  data: any; // Store full object for potential export
}

export enum AppMode {
  INPUT = 'INPUT',
  LUCKY_DRAW = 'LUCKY_DRAW',
  TEAM_BUILDER = 'TEAM_BUILDER',
  HISTORY = 'HISTORY',
}