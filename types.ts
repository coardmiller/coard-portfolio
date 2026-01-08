export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  year: string;
  description?: string;
  detailImages?: string[];
  role?: string;
  client?: string;
}

export type ViewMode = 'GRID' | 'LIST';

export type Page = 'HOME' | 'ABOUT' | 'CASE_STUDY' | 'PLAYGROUND';

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface CVItem {
  year: string;
  role: string;
  company: string;
  location: string;
}