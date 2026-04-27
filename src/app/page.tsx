'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore, useAppStore } from '@/store/index';
import { useThemeStore, applyThemeToDocument } from '@/store/theme';
import LoginPage from '@/components/login/login-page';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import DashboardPage from '@/components/dashboard/dashboard-page';
import ProjectsPage from '@/components/projects/projects-page';
import TasksPage from '@/components/tasks/tasks-page';
import ResultsPage from '@/components/results/results-page';
import FilesPage from '@/components/files/files-page';
import SettingsPage from '@/components/settings/settings-page';
import type { PageType } from '@/lib/types';

const PAGE_MAP: Record<PageType, React.FC> = {
  dashboard: DashboardPage,
  projects: ProjectsPage,
  tasks: TasksPage,
  results: ResultsPage,
  files: FilesPage,
  settings: SettingsPage,
  login: LoginPage,
};

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentPage = useAppStore((s) => s.currentPage);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const getCurrentConfig = useThemeStore((s) => s.getCurrentConfig);

  // Apply saved theme on mount and whenever it changes
  useEffect(() => {
    applyThemeToDocument(getCurrentConfig());
  }, [currentTheme, getCurrentConfig]);

  // Save theme to localStorage on change
  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const PageComponent = PAGE_MAP[currentPage] || DashboardPage;

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--theme-background)' }}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-[1600px] mx-auto"
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
