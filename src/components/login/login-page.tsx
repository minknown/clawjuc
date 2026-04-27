'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, User, Lock, Eye, EyeOff, Loader2, Shield, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/index';
import { useThemeStore, applyThemeToDocument } from '@/store/theme';

/* ------------------------------------------------------------------ */
/*  Matrix Rain Canvas                                                */
/* ------------------------------------------------------------------ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const chars = 'DATA0123456789ABCDEF{}[]<>/:.@#$%&*爬虫采集数据网络HTTPAPIJSONXML';
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#00f0ff';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const opacity = 0.08 + Math.random() * 0.12;
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = opacity;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        ctx.globalAlpha = 1;

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Background Orbs                                          */
/* ------------------------------------------------------------------ */
function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'var(--theme-primary)',
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 -bottom-32 h-[600px] w-[600px] rounded-full opacity-15 blur-[140px]"
        style={{
          background: 'var(--theme-accent)',
        }}
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 50, -80, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-10 blur-[100px]"
        style={{
          background: 'var(--theme-primary)',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 60, 0],
          scale: [0.8, 1.1, 0.9, 0.8],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Circuit Grid Overlay                                              */
/* ------------------------------------------------------------------ */
function CircuitGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(var(--theme-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Border Component                                         */
/* ------------------------------------------------------------------ */
function AnimatedBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      {/* Animated gradient border wrapper */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[1px]"
        style={{
          background: 'var(--theme-gradient)',
        }}
      />
      {/* Rotating glow */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl"
        style={{
          background: 'conic-gradient(from 0deg, transparent, var(--theme-primary), transparent, var(--theme-accent), transparent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="h-full w-full rounded-2xl"
          style={{ background: 'var(--theme-card)' }}
        />
      </motion.div>
      {/* Actual card content */}
      <div className="relative z-10 rounded-2xl">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Particle dots floating around                                     */
/* ------------------------------------------------------------------ */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'var(--theme-primary)',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main LoginPage Component                                          */
/* ------------------------------------------------------------------ */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const { getCurrentConfig } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    applyThemeToDocument(getCurrentConfig());
  }, [getCurrentConfig]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);

      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 600));
      login(username, password);
      setIsLoading(false);
    },
    [login, username, password, isLoading]
  );

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ background: 'var(--theme-background)' }}
    >
      {/* === Background layers === */}
      <MatrixRain />
      <BackgroundOrbs />
      <CircuitGrid />
      <FloatingParticles />

      {/* === Login Card === */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <AnimatedBorder>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl px-8 pb-8 pt-10 backdrop-blur-xl sm:px-10"
            style={{
              background: 'color-mix(in srgb, var(--theme-card) 85%, transparent)',
              boxShadow: 'var(--theme-glow), 0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* --- Logo & Title --- */}
            <motion.div
              className="mb-8 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Animated logo icon */}
              <motion.div
                className="relative mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background: 'var(--theme-gradient)',
                    boxShadow: 'var(--theme-glow)',
                  }}
                  animate={{
                    boxShadow: [
                      'var(--theme-glow)',
                      '0 0 40px var(--theme-primary), 0 0 80px var(--theme-accent)',
                      'var(--theme-glow)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bug
                    className="h-9 w-9"
                    style={{ color: 'var(--theme-primary-foreground)' }}
                    strokeWidth={2}
                  />
                </motion.div>
                {/* Orbiting dot */}
                <motion.div
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    background: 'var(--theme-primary)',
                    boxShadow: '0 0 6px var(--theme-primary)',
                  }}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  initial={{ top: -4, left: '50%', transformOrigin: '0 36px' }}
                />
              </motion.div>

              <motion.h1
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: 'var(--theme-foreground)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                DataCrawler Pro
              </motion.h1>

              <motion.div
                className="mt-1 flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Activity
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--theme-primary)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  数据采集管理系统
                </span>
              </motion.div>
            </motion.div>

            {/* --- Form --- */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Username */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  用户名
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--theme-muted-foreground)' }}
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-xs focus:ring-2"
                    style={{
                      background: 'var(--theme-secondary)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-foreground)',
                      '--tw-ring-color': 'var(--theme-primary)',
                    } as React.CSSProperties}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  密码
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--theme-muted-foreground)' }}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition-all duration-200 placeholder:text-xs focus:ring-2"
                    style={{
                      background: 'var(--theme-secondary)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-foreground)',
                      '--tw-ring-color': 'var(--theme-primary)',
                    } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 hover:opacity-80"
                    style={{ color: 'var(--theme-muted-foreground)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs"
                      style={{
                        background: 'color-mix(in srgb, var(--theme-destructive) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--theme-destructive) 25%, transparent)',
                        color: 'var(--theme-destructive)',
                      }}
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'var(--theme-gradient)',
                    color: 'var(--theme-primary-foreground)',
                  }}
                  whileHover={
                    !isLoading && username && password
                      ? {
                          scale: 1.02,
                          boxShadow: '0 0 30px var(--theme-primary), 0 0 60px var(--theme-accent)',
                        }
                      : undefined
                  }
                  whileTap={
                    !isLoading && username && password
                      ? { scale: 0.98 }
                      : undefined
                  }
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                    }}
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        正在验证...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        安全登录
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </motion.form>

            {/* --- Demo accounts hint --- */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{
                  background: 'color-mix(in srgb, var(--theme-secondary) 50%, transparent)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: 'var(--theme-primary)',
                    boxShadow: '0 0 6px var(--theme-primary)',
                  }}
                />
                <span
                  className="text-[11px] leading-relaxed"
                  style={{ color: 'var(--theme-muted-foreground)' }}
                >
                  演示账户: admin / admin123 &nbsp;|&nbsp; operator / oper123 &nbsp;|&nbsp; viewer / view123
                </span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatedBorder>

        {/* Bottom scan line effect */}
        <motion.div
          className="mx-auto mt-6 h-[1px] w-48 overflow-hidden rounded-full"
          style={{ background: 'var(--theme-border)' }}
        >
          <motion.div
            className="h-full w-1/3 rounded-full"
            style={{ background: 'var(--theme-primary)' }}
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* === Version & copyright footer === */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p
          className="text-xs"
          style={{ color: 'var(--theme-muted-foreground)', opacity: 0.5 }}
        >
          DataCrawler Pro v2.1.0 &mdash; 高性能分布式数据采集管理平台
        </p>
      </motion.div>
    </div>
  );
}
