import { create } from 'zustand';
import { User, PageType } from '@/lib/types';
import { HARDCODED_USERS } from '@/lib/mock-data';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loginError: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  loginError: null,
  login: (username: string, password: string) => {
    const user = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      set({ isAuthenticated: true, currentUser: { id: user.id, username: user.username, role: user.role, displayName: user.displayName }, loginError: null });
      return true;
    }
    set({ loginError: '用户名或密码错误' });
    return false;
  },
  logout: () => set({ isAuthenticated: false, currentUser: null }),
}));

interface AppState {
  currentPage: PageType;
  sidebarCollapsed: boolean;
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
