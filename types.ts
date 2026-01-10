
export type View = 'dashboard' | 'tracker' | 'analytics' | 'coach' | 'settings';

export enum Mood {
  GREAT = 'GREAT',
  OKAY = 'OKAY',
  EXHAUSTED = 'EXHAUSTED',
}

export interface Session {
  id: string;
  category: string;
  duration: number; // in seconds
  timestamp: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSessionData {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
}

export interface UserStats {
  sessions: Session[];
  moods: { date: string; mood: Mood }[];
  dailyGoalSeconds: number;
}

// Profile & Settings Types
export type Role = 'Student' | 'Developer' | 'Engineer' | 'Freelancer';
export type Field = 'Web Dev' | 'App Dev' | 'Backend' | 'AI / ML' | 'DSA / CP';
export type Focus = 'Placements' | 'Internships' | 'Learning' | 'Projects';

export interface GithubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: { commits?: { message: string }[] };
  created_at: string;
}

export interface GithubStats {
  username: string;
  followers: number;
  following: number;
  public_repos: number;
  avatar_url?: string;
  total_commits_estimate?: number; // Estimated from recent events or public count
  recent_events?: GithubEvent[];
  last_fetched?: number;
}

export interface LinkedinStats {
  connections: number;
  followers: number;
  posts: number;
  profileViews?: number;
  postImpressions?: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  role: Role;
  field: Field;
  currentFocus: Focus;
  isStudent: boolean;
  hasCompletedOnboarding: boolean; 
  chatHistory: ChatSessionData[]; // New: Stores previous AI conversations
  education?: {
    university: string;
    degree: string;
    year: string;
    gradYear: string;
  };
  work?: {
    company: string;
    title: string;
    experience: string;
    type: 'Remote' | 'Hybrid' | 'Onsite';
  };
  integrations: {
    github: string; // URL
    githubToken?: string; // Optional PAT for higher rate limits
    linkedin: string; // URL
  };
  stats?: {
    github?: GithubStats;
    linkedin?: LinkedinStats;
  };
  preferences: {
    workHours: string;
    breakFrequency: number; // minutes
    focusStyle: 'Deep Work' | 'Short Bursts' | 'Flow';
    notifications: {
      burnout: boolean;
      breaks: boolean;
      reports: boolean;
      checkins: boolean;
    };
    privacy: {
      aiPersonalization: boolean;
      dataImprovement: boolean;
    };
  };
}

export interface AuthProps {
  onLogin: (data: any) => void;
}
