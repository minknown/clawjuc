'use client';

import { motion } from 'framer-motion';
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/index';
import { useAuthStore } from '@/store/index';
import { useThemeStore } from '@/store/theme';
import type { PageType } from '@/lib/types';

const PAGE_NAME_MAP: Record<PageType, string> = {
  dashboard: '仪表盘',
  projects: '采集项目',
  tasks: '采集任务',
  results: '采集结果',
  files: '文件管理',
  settings: '系统设置',
  login: '登录',
};

export default function Header() {
  const { currentPage, toggleSidebar } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const { currentTheme, availableThemes } = useThemeStore();

  const currentThemeConfig = availableThemes.find((t) => t.name === currentTheme);
  const pageName = PAGE_NAME_MAP[currentPage] ?? '仪表盘';
  const displayName = currentUser?.displayName ?? '用户';
  const initials = displayName.charAt(0);
  const role = currentUser?.role ?? 'viewer';
  const roleMap: Record<string, string> = {
    admin: '管理员',
    operator: '操作员',
    viewer: '查看者',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-6"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-background) 80%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--theme-border)',
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0 transition-colors duration-200 hover:bg-[var(--theme-muted)]"
          style={{ color: 'var(--theme-muted-foreground)' }}
          aria-label="切换侧边栏"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <span
            className="text-xs"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            DataCrawler
          </span>
          <ChevronRight
            className="h-3 w-3"
            style={{ color: 'var(--theme-muted-foreground)' }}
          />
          <span
            className="font-medium"
            style={{ color: 'var(--theme-foreground)' }}
          >
            {pageName}
          </span>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme indicator */}
        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: currentThemeConfig?.colors.primary ?? 'var(--theme-primary)',
              boxShadow: `0 0 6px ${currentThemeConfig?.colors.primary ?? 'var(--theme-primary)'}`,
            }}
          />
          <span
            className="text-xs"
            style={{ color: 'var(--theme-muted-foreground)' }}
          >
            {currentThemeConfig?.label ?? '赛博暗黑'}
          </span>
        </div>

        <Separator
          orientation="vertical"
          className="hidden h-6 sm:block"
          style={{ borderColor: 'var(--theme-border)' }}
        />

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0 transition-colors duration-200 hover:bg-[var(--theme-muted)]"
          style={{ color: 'var(--theme-muted-foreground)' }}
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
            style={{ backgroundColor: 'var(--theme-destructive)' }}
          >
            5
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors duration-200 hover:bg-[var(--theme-muted)]"
              style={{ color: 'var(--theme-foreground)' }}
            >
              <Avatar
                className="h-8 w-8"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary-foreground)',
                }}
              >
                <AvatarFallback className="text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-foreground)',
            }}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold" style={{ color: 'var(--theme-foreground)' }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: 'var(--theme-muted-foreground)' }}>
                  {currentUser?.username ?? 'user'}
                </p>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px]"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-primary)',
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                  }}
                >
                  {roleMap[role] ?? role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ borderColor: 'var(--theme-border)' }} />
            <DropdownMenuItem
              className="cursor-pointer transition-colors duration-150 focus:bg-[var(--theme-muted)] focus:text-[var(--theme-foreground)]"
              style={{ color: 'var(--theme-muted-foreground)' }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>个人信息</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ borderColor: 'var(--theme-border)' }} />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer transition-colors duration-150 focus:bg-[var(--theme-destructive)] focus:text-white"
              style={{ color: 'var(--theme-destructive)' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
