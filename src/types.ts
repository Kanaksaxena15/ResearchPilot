export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Paper {
  id: number;
  user_id: number;
  filename: string;
  title: string;
  created_at: string;
  text_length?: number;
  has_summary: boolean;
  has_insights: boolean;
  summary?: string;
  insights?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
