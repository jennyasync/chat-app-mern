import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Check,
  CheckCheck,
  Globe2,
  Lock,
  MessagesSquare,
  Search,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Footer from '../components/common/Footer.jsx';
import { ROUTES } from '../utils/constants.js';

/**
 * LandingPage — animated public marketing surface served at `/`.
 *
 * Motion plan:
 *   - Hero: one orchestrated load sequence + a live, looping chat demo
 *     that shows the product's real behaviours (typing, ✓ → ✓✓, reactions).
 *   - Ambient: slow aurora blobs, drifting particles, shimmering headline.
 *   - Scroll: sections reveal once, stats count up, the steps line draws in.
 *   - Interaction: spotlight + icon micro-animations on feature cards,
 *     3D tilt on the chat window, sheen on primary buttons.
 *
 * Accessibility:
 *   Every animation is disabled by the global `prefers-reduced-motion`
 *   rule and the user-level `.no-anim` class in `index.css`. The chat demo
 *   also checks both and renders its final state statically.
 *
 * Styling:
 *   Layout uses the existing Tailwind + brand tokens. Keyframes live in the
 *   scoped <style> block below (all classes prefixed `lp-`) so this file is
 *   a drop-in replacement with no other changes needed.
 */

const FEATURES = [
  {
    icon: Zap,
    anim: 'lp-icon-zap',
    title: 'Real-time messaging',
    description:
      'Socket.io delivery with typing indicators and read receipts, so replies land the moment they are sent.',
  },
  {
    icon: Users,
    anim: 'lp-icon-users',
    title: 'Group conversations',
    description:
      'Start a room, invite people, pick admins and share images. Everyone stays in sync across devices.',
  },
  {
    icon: BellRing,
    anim: 'lp-icon-bell',
    title: 'Notifications you control',
    description:
      'Browser, sound and in-app alerts. Mute a noisy chat and the open conversation never pings you.',
  },
  {
    icon: Lock,
    anim: 'lp-icon-lock',
    title: 'Privacy built in',
    description:
      'Hide your online status or read receipts, block anyone, and report abuse straight to moderators.',
  },
  {
    icon: Globe2,
    anim: 'lp-icon-globe',
    title: 'Works anywhere',
    description:
      'A responsive layout for phone, tablet and desktop, with light and dark themes that follow you.',
  },
  {
    icon: Sparkles,
    anim: 'lp-icon-spark',
    title: 'Fast by default',
    description:
      'React 19, Vite and Tailwind v4 keep the first load light and every interaction quick.',
  },
];

const STATS = [
  { value: 100, prefix: '<', suffix: 'ms', label: 'typical message delivery' },
  { value: 5, suffix: ' MB', label: 'image uploads per message' },
  { value: 15, suffix: ' min', label: 'to edit what you sent' },
  { value: 25, suffix: '+', label: 'live socket events' },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    description: 'Pick a username and you are in. No credit card, no setup.',
  },
  {
    icon: Search,
    title: 'Find your people',
    description: 'Search by name to start a direct chat, or build a group in a few taps.',
  },
  {
    icon: MessagesSquare,
    title: 'Start talking',
    description: 'Send messages, photos and reactions, and watch them arrive live.',
  },
];

const STACK = ['React 19', 'Socket.io', 'Express 5', 'MongoDB', 'Tailwind v4', 'Vite', 'Cloudinary', 'JWT'];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const prefersStill = () => {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('no-anim')
  );
};

/** Adds `is-visible` once the element scrolls into view. */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return [ref, visible];
};

const Reveal = ({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) => {
  const [ref, visible] = useReveal();
  const [settled, setSettled] = useState(false);
  return (
    <Tag
      ref={ref}
      className={`lp-reveal ${visible ? 'is-visible' : ''} ${className}`}
      // Stagger only the entrance; drop the delay afterwards so hover feels instant.
      style={{ transitionDelay: settled ? '0ms' : `${delay}ms` }}
      onTransitionEnd={(e) => {
        if (visible && e.target === e.currentTarget) setSettled(true);
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const CountUp = ({ value, prefix = '', suffix = '', start }) => {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    if (prefersStill()) {
      setN(value);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Live chat demo                                                      */
/* ------------------------------------------------------------------ */

/**
 * Each step is the cumulative state of the demo at that moment.
 * The loop runs through them, then pauses and restarts.
 */
const DEMO_STEPS = [
  { at: 400, show: 1 },
  { at: 1500, show: 1, typing: 'M' },
  { at: 3200, show: 2 },
  { at: 4300, show: 3, tick: 'sent' },
  { at: 5400, show: 3, tick: 'read' },
  { at: 6300, show: 3, tick: 'read', reaction: true },
  { at: 7600, show: 3, tick: 'read', reaction: true, typing: 'A' },
  { at: 9200, show: 4, tick: 'read', reaction: true },
];
const DEMO_LOOP = 12500;
const FINAL = DEMO_STEPS[DEMO_STEPS.length - 1];

const MESSAGES = [
  { from: 'A', name: 'Aisha', text: 'Pushed the new build 🚀', color: 'blue' },
  { from: 'M', name: 'Marco', text: 'Testing it now. It is so fast!', color: 'amber' },
  { from: 'me', text: 'Told you sockets would fix it 😄' },
  { from: 'A', name: 'Aisha', text: 'Shipping it to everyone tonight', color: 'blue' },
];

const Avatar = ({ letter, color }) => (
  <span
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
      color === 'amber'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200'
        : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
    }`}
  >
    {letter}
  </span>
);

const TypingBubble = ({ letter }) => (
  <div className="lp-bubble-in flex items-end gap-2">
    <Avatar letter={letter} color={letter === 'M' ? 'amber' : 'blue'} />
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
      <span className="lp-typing-dot" />
      <span className="lp-typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="lp-typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const LiveChatDemo = () => {
  const [state, setState] = useState(() => (prefersStill() ? FINAL : { show: 0 }));
  const cardRef = useRef(null);

  useEffect(() => {
    if (prefersStill()) return undefined;
    let timers = [];
    const run = () => {
      setState({ show: 0 });
      timers = DEMO_STEPS.map((s) => setTimeout(() => setState(s), s.at));
      timers.push(setTimeout(run, DEMO_LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Gentle 3D tilt that follows the pointer.
  const onMove = (e) => {
    const el = cardRef.current;
    if (!el || prefersStill()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
  };
  const onLeave = () => {
    cardRef.current?.style.setProperty('--rx', '0deg');
    cardRef.current?.style.setProperty('--ry', '0deg');
  };

  const visible = MESSAGES.slice(0, state.show);

  return (
    <div className="lp-tilt-wrap" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div
        ref={cardRef}
        className="lp-tilt relative w-full overflow-hidden rounded-3xl border border-gray-200 bg-white/90 shadow-2xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/85"
        role="img"
        aria-label="Animated preview of a group conversation with typing indicators, read receipts and a reaction"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="ring-2 ring-white dark:ring-gray-900 rounded-full">
                <Avatar letter="A" color="blue" />
              </span>
              <span className="ring-2 ring-white dark:ring-gray-900 rounded-full">
                <Avatar letter="M" color="amber" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">launch-team</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {state.typing
                  ? `${state.typing === 'M' ? 'Marco' : 'Aisha'} is typing…`
                  : '3 members'}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="lp-presence" />3 online
          </span>
        </div>

        <div className="flex h-80 flex-col justify-end gap-3 px-5 py-5">
          {visible.map((m, i) =>
            m.from === 'me' ? (
              <div key={i} className="lp-bubble-in-right flex flex-col items-end">
                <div className="relative max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-md lp-me-bubble">
                  {m.text}
                  {state.reaction && (
                    <span className="lp-reaction absolute -bottom-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-sm shadow dark:border-gray-700 dark:bg-gray-800">
                      ❤️
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 flex items-center gap-1 text-[11px] transition-colors duration-500 ${
                    state.tick === 'read' ? 'text-brand-500 dark:text-brand-400' : 'text-gray-400'
                  }`}
                >
                  {state.tick === 'read' ? (
                    <>
                      <CheckCheck className="lp-tick-pop h-3.5 w-3.5" aria-hidden="true" /> Read
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Delivered
                    </>
                  )}
                </span>
              </div>
            ) : (
              <div key={i} className="lp-bubble-in flex items-end gap-2">
                <Avatar letter={m.from} color={m.color} />
                <div className="max-w-[78%]">
                  <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">{m.name}</p>
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                    {m.text}
                  </div>
                </div>
              </div>
            ),
          )}
          {state.typing && <TypingBubble letter={state.typing} />}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            Write a message…
          </div>
          <span className="lp-send flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Floating presence cards around the window */}
      <div className="lp-float pointer-events-none absolute -bottom-5 left-6 hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium shadow-lg sm:flex dark:border-gray-800 dark:bg-gray-900">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Marco is online
      </div>
      <div
        className="lp-float pointer-events-none absolute -top-5 right-6 hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium shadow-lg sm:flex dark:border-gray-800 dark:bg-gray-900"
        style={{ animationDelay: '-3s' }}
      >
        <BellRing className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" /> 2 new messages
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const FeatureCard = ({ icon: Icon, anim, title, description, index }) => {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <Reveal
      as="li"
      delay={index * 90}
      onMouseMove={onMove}
      className={`lp-card group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 ${anim}`}
    >
      <span className="lp-card-icon relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-200 dark:group-hover:bg-brand-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="relative mt-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </Reveal>
  );
};

const StatsStrip = () => {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} aria-label="Chatty in numbers" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 lg:grid-cols-4 dark:border-gray-800 dark:bg-gray-800">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`lp-reveal bg-white px-6 py-7 text-center dark:bg-gray-950 ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              <CountUp start={visible} {...s} />
            </dd>
            <dd className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const Steps = () => {
  const [ref, visible] = useReveal();
  return (
    <section id="how-it-works" aria-labelledby="stepsHeading" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 id="stepsHeading" className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          From sign-up to first message in a minute
        </h2>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">Three steps. That is the whole onboarding.</p>
      </Reveal>

      <ol ref={ref} className={`lp-steps relative mt-14 grid gap-10 md:grid-cols-3 ${visible ? 'is-visible' : ''}`}>
        <span aria-hidden="true" className="lp-steps-line absolute left-[16%] right-[16%] top-7 hidden h-0.5 md:block" />
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <li
            key={title}
            className={`lp-reveal relative text-center ${visible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${250 + i * 220}ms` }}
          >
            <span className="lp-step-badge relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-700 ring-2 ring-brand-600 dark:bg-gray-950 dark:text-brand-300">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner fullPage size="lg" />;
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;

  const year = new Date().getFullYear();

  return (
    <div className="lp-root min-h-screen overflow-x-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <style>{LANDING_CSS}</style>

      <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/75 backdrop-blur-md dark:border-gray-800/70 dark:bg-gray-950/75">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to={ROUTES.HOME} className="lp-logo flex items-center gap-2 font-semibold tracking-tight">
            <span className="lp-logo-mark flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <MessagesSquare className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>Chatty</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#features" className="lp-navlink hidden rounded-md px-3 py-2 text-sm font-medium text-gray-600 md:inline-block dark:text-gray-300">
              Features
            </a>
            <a href="#how-it-works" className="lp-navlink hidden rounded-md px-3 py-2 text-sm font-medium text-gray-600 md:inline-block dark:text-gray-300">
              How it works
            </a>
            <Link to={ROUTES.LOGIN} className="lp-navlink rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="lp-btn-primary hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm sm:inline-flex"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative isolate">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="lp-grid absolute inset-0" />
            <div className="lp-aurora lp-aurora-1" />
            <div className="lp-aurora lp-aurora-2" />
            <div className="lp-aurora lp-aurora-3" />
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="lp-particle"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  animationDelay: `${-i * 1.3}s`,
                  animationDuration: `${9 + (i % 5) * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <span className="lp-load inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/30 dark:text-brand-200" style={{ animationDelay: '0ms' }}>
                <span className="lp-presence" />
                Now with real-time presence
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] dark:text-white">
                {['Conversations', 'that', 'feel'].map((w, i) => (
                  <span key={w} className="lp-load inline-block" style={{ animationDelay: `${120 + i * 90}ms` }}>
                    {w}&nbsp;
                  </span>
                ))}
                <span className="lp-load inline-block" style={{ animationDelay: '390ms' }}>
                  <span className="lp-shimmer">instant</span>.
                </span>
              </h1>

              <p className="lp-load mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg lg:mx-0 dark:text-gray-400" style={{ animationDelay: '480ms' }}>
                A modern chat experience for teams, communities and friends. Real-time messaging, group rooms and a
                polished interface, without the bloat.
              </p>

              <div className="lp-load mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: '500ms' }}>
                <Link
                  to={ROUTES.CHAT}
                  className="lp-btn-primary group inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25"
                >
                  <MessagesSquare className="h-4 w-4" aria-hidden="true" />
                  <span>Open Chat</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="lp-btn-ghost inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  Create an account
                </Link>
              </div>

              <p className="lp-load mt-4 text-xs text-gray-500" style={{ animationDelay: '620ms' }}>
                Free for personal use. No credit card required.
              </p>
            </div>

            <div className="lp-load-scale relative mx-auto w-full max-w-md lg:max-w-none" style={{ animationDelay: '300ms' }}>
              <LiveChatDemo />
            </div>
          </div>
        </section>

        {/* ---------------- Stack marquee ---------------- */}
        <section aria-label="Built with" className="border-y border-gray-200 bg-gray-50/70 py-5 dark:border-gray-800 dark:bg-gray-900/40">
          <div className="lp-marquee">
            <div className="lp-marquee-track">
              {[...STACK, ...STACK].map((t, i) => (
                <span key={i} aria-hidden={i >= STACK.length} className="mx-8 inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <div className="pt-16">
          <StatsStrip />
        </div>

        {/* ---------------- Features ---------------- */}
        <section id="features" aria-labelledby="featuresHeading" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 id="featuresHeading" className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Everything you need to stay in touch
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Thoughtful defaults, fast performance and zero noise. The features you would expect, and none you
              would not.
            </p>
          </Reveal>

          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} index={i} {...f} />
            ))}
          </ul>
        </section>

        {/* ---------------- Steps ---------------- */}
        <div className="border-t border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/30">
          <Steps />
        </div>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="lp-cta relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {['💬', '❤️', '👍', '🚀', '😄', '✓✓'].map((e, i) => (
                <span
                  key={i}
                  className="lp-cta-bubble"
                  style={{
                    left: `${8 + i * 16}%`,
                    animationDelay: `${-i * 1.7}s`,
                    animationDuration: `${8 + (i % 3) * 2}s`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>

            <h2 className="relative text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to start chatting?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base text-brand-100">
              Jump straight into the conversation. It only takes a few seconds.
            </p>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={ROUTES.CHAT}
                className="lp-btn-light group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm"
              >
                <MessagesSquare className="h-4 w-4" aria-hidden="true" />
                <span>Open Chat</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6 dark:text-gray-400">
          <p className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white">
              <MessagesSquare className="h-3 w-3" aria-hidden="true" />
            </span>
            <span>© {year} Chatty. All rights reserved.</span>
          </p>
          <nav className="flex items-center gap-4">
            <Link to={ROUTES.LOGIN} className="lp-navlink hover:text-gray-900 dark:hover:text-white">
              Sign in
            </Link>
            <Link to={ROUTES.REGISTER} className="lp-navlink hover:text-gray-900 dark:hover:text-white">
              Register
            </Link>
          </nav>
        </div>
        <Footer className="border-0 border-t border-gray-200 dark:border-gray-800" />
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scoped styles                                                       */
/* ------------------------------------------------------------------ */

const LANDING_CSS = `
.lp-root{
  --lp-brand:var(--color-brand-500,#3b82f6);
  --lp-brand-600:var(--color-brand-600,#2563eb);
  --lp-brand-700:var(--color-brand-700,#1d4ed8);
  --lp-brand-300:var(--color-brand-300,#93c5fd);
  --lp-glow:rgba(59,130,246,.22);
  --lp-grid:rgba(15,23,42,.06);
  --lp-dot:#9ca3af;
}
.dark .lp-root{ --lp-glow:rgba(59,130,246,.28); --lp-grid:rgba(148,163,184,.07); --lp-dot:#6b7280; }

/* Page-load sequence */
.lp-load{opacity:0;animation:lp-rise .8s cubic-bezier(.2,.7,.2,1) forwards}
.lp-load-scale{opacity:0;animation:lp-zoom 1s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes lp-rise{from{opacity:0;transform:translateY(18px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes lp-zoom{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}

/* Shimmering headline word */
.lp-shimmer{
  background:linear-gradient(100deg,var(--lp-brand-600) 0%,var(--lp-brand) 35%,var(--lp-brand-300) 50%,var(--lp-brand) 65%,var(--lp-brand-700) 100%);
  background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
  animation:lp-shine 4.5s ease-in-out infinite;
}
@keyframes lp-shine{0%{background-position:100% 0}60%,100%{background-position:-50% 0}}

/* Ambient background */
.lp-grid{
  background-image:linear-gradient(var(--lp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--lp-grid) 1px,transparent 1px);
  background-size:44px 44px;
  -webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%);
  mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%);
}
.lp-aurora{position:absolute;border-radius:9999px;filter:blur(70px);opacity:.9;background:var(--lp-glow)}
.lp-aurora-1{width:34rem;height:34rem;left:-8rem;top:-10rem;animation:lp-drift 18s ease-in-out infinite}
.lp-aurora-2{width:28rem;height:28rem;right:-6rem;top:4rem;background:rgba(37,99,235,.22);animation:lp-drift 22s ease-in-out infinite reverse}
.lp-aurora-3{width:20rem;height:20rem;left:40%;bottom:-8rem;background:rgba(16,185,129,.12);animation:lp-drift 26s ease-in-out infinite}
@keyframes lp-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(4rem,2rem) scale(1.1)}66%{transform:translate(-3rem,3rem) scale(.95)}}
.lp-particle{position:absolute;width:4px;height:4px;border-radius:9999px;background:var(--lp-brand-300);opacity:0;animation:lp-particle 11s linear infinite}
@keyframes lp-particle{0%{opacity:0;transform:translateY(0)}15%{opacity:.7}85%{opacity:.5}100%{opacity:0;transform:translateY(-140px)}}

/* Presence dot */
.lp-presence{position:relative;display:inline-block;width:8px;height:8px;border-radius:9999px;background:#10b981}
.lp-presence::after{content:"";position:absolute;inset:0;border-radius:inherit;background:#10b981;animation:lp-ping 1.8s cubic-bezier(0,0,.2,1) infinite}
@keyframes lp-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.8);opacity:0}}

/* Chat demo */
.lp-tilt-wrap{position:relative;perspective:1200px}
.lp-tilt{transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .4s cubic-bezier(.2,.7,.2,1);transform-style:preserve-3d}
.lp-me-bubble{background:linear-gradient(135deg,var(--lp-brand),var(--lp-brand-700))}
.lp-bubble-in{animation:lp-bubble-l .45s cubic-bezier(.2,.9,.3,1.2) both;transform-origin:bottom left}
.lp-bubble-in-right{animation:lp-bubble-r .45s cubic-bezier(.2,.9,.3,1.2) both;transform-origin:bottom right}
@keyframes lp-bubble-l{from{opacity:0;transform:translateY(12px) scale(.85)}to{opacity:1;transform:none}}
@keyframes lp-bubble-r{from{opacity:0;transform:translate(10px,12px) scale(.85)}to{opacity:1;transform:none}}
.lp-typing-dot{width:7px;height:7px;border-radius:9999px;background:var(--lp-dot);animation:lp-bounce 1s ease-in-out infinite}
@keyframes lp-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}
.lp-reaction{animation:lp-pop .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes lp-pop{0%{transform:scale(0) rotate(-20deg)}100%{transform:scale(1) rotate(0)}}
.lp-tick-pop{animation:lp-pop .4s cubic-bezier(.2,1.6,.4,1) both}
.lp-send{animation:lp-breathe 2.6s ease-in-out infinite}
@keyframes lp-breathe{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.45)}50%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
.lp-float{animation:lp-floaty 6s ease-in-out infinite}
@keyframes lp-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

/* Buttons and links */
.lp-btn-primary{position:relative;overflow:hidden;transition:transform .2s,box-shadow .3s,background-color .2s}
.lp-btn-primary:hover{transform:translateY(-1px);background-color:var(--lp-brand-700)}
.lp-btn-primary:active{transform:translateY(0) scale(.98)}
.lp-btn-primary::after,.lp-btn-light::after{content:"";position:absolute;inset:0;transform:translateX(-120%) skewX(-20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)}
.lp-btn-primary:hover::after,.lp-btn-light:hover::after{transition:transform .7s ease;transform:translateX(120%) skewX(-20deg)}
.lp-btn-light{position:relative;overflow:hidden;transition:transform .2s}
.lp-btn-light:hover{transform:translateY(-1px)}
.lp-btn-ghost{transition:transform .2s,border-color .2s,background-color .2s}
.lp-btn-ghost:hover{transform:translateY(-1px);border-color:var(--lp-brand)}
.lp-navlink{position:relative;transition:color .2s}
.lp-navlink:hover{color:var(--lp-brand-600)}
.dark .lp-navlink:hover{color:#fff}
.lp-logo-mark{transition:transform .5s cubic-bezier(.2,1.6,.4,1)}
.lp-logo:hover .lp-logo-mark{transform:rotate(-12deg) scale(1.08)}

/* Marquee */
.lp-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.lp-marquee-track{display:inline-flex;min-width:max-content;animation:lp-scroll 28s linear infinite}
.lp-marquee:hover .lp-marquee-track{animation-play-state:paused}
@keyframes lp-scroll{to{transform:translateX(-50%)}}

/* Scroll reveal */
.lp-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
.lp-reveal.is-visible{opacity:1;transform:none}

/* Feature cards: spotlight + per-icon motion */
.lp-card{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s,border-color .35s,opacity .7s ease}
.lp-card.is-visible:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(37,99,235,.45);border-color:rgba(59,130,246,.45)}
.lp-card::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),var(--lp-glow),transparent 70%)}
.lp-card:hover::before{opacity:1}
.lp-icon-zap:hover .lp-card-icon svg{animation:lp-flicker .6s steps(2) 2}
.lp-icon-bell:hover .lp-card-icon svg{animation:lp-ring .8s ease-in-out;transform-origin:top center}
.lp-icon-lock:hover .lp-card-icon svg{animation:lp-shake .5s ease-in-out}
.lp-icon-users:hover .lp-card-icon svg{animation:lp-hop .6s ease}
.lp-icon-globe:hover .lp-card-icon svg{animation:lp-spin 1.2s ease-in-out}
.lp-icon-spark:hover .lp-card-icon svg{animation:lp-twinkle .8s ease}
@keyframes lp-flicker{50%{opacity:.3}}
@keyframes lp-ring{0%,100%{transform:rotate(0)}20%{transform:rotate(18deg)}40%{transform:rotate(-14deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-4deg)}}
@keyframes lp-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes lp-hop{40%{transform:translateY(-5px)}}
@keyframes lp-spin{to{transform:rotate(360deg)}}
@keyframes lp-twinkle{50%{transform:scale(1.3) rotate(15deg)}}

/* Steps: connecting line draws in */
.lp-steps-line{background:linear-gradient(90deg,var(--lp-brand),var(--lp-brand-300));transform:scaleX(0);transform-origin:left;transition:transform 1.2s cubic-bezier(.6,0,.2,1) .2s}
.lp-steps.is-visible .lp-steps-line{transform:scaleX(1)}
.lp-step-badge{transition:transform .3s}
.lp-steps li:hover .lp-step-badge{transform:translateY(-4px) rotate(-4deg)}

/* CTA */
.lp-cta{background:linear-gradient(120deg,var(--lp-brand-600),var(--lp-brand-700),#1e40af,var(--lp-brand-600));background-size:300% 300%;animation:lp-gradient 12s ease infinite}
@keyframes lp-gradient{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.lp-cta-bubble{position:absolute;bottom:-3rem;font-size:1.5rem;opacity:0;animation:lp-cta-rise 9s linear infinite}
@keyframes lp-cta-rise{0%{opacity:0;transform:translateY(0) scale(.8)}15%{opacity:.55}80%{opacity:.35}100%{opacity:0;transform:translateY(-26rem) scale(1.1)}}

@media (prefers-reduced-motion: reduce){
  .lp-load,.lp-load-scale,.lp-reveal{opacity:1!important;transform:none!important;filter:none!important}
  .lp-particle,.lp-cta-bubble{display:none}
}
.no-anim .lp-load,.no-anim .lp-load-scale,.no-anim .lp-reveal{opacity:1!important;transform:none!important;filter:none!important}
.no-anim .lp-particle,.no-anim .lp-cta-bubble{display:none}
`;

export default LandingPage;
