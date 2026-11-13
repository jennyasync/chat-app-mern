import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Check,
  CheckCheck,
  Globe2,
  Lock,
  MessagesSquare,
  Pencil,
  Search,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Footer from '../components/common/Footer.jsx';
import { ROUTES } from '../utils/constants.js';

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-time messaging',
    description: 'Messages go over Socket.io, with typing indicators and read receipts.',
  },
  {
    icon: Users,
    title: 'Group chats',
    description: 'Create a group, add people, pick admins and share images.',
  },
  {
    icon: BellRing,
    title: 'Notifications you control',
    description: 'Browser, sound and in-app alerts. Mute any chat you do not want to hear from.',
  },
  {
    icon: Lock,
    title: 'Privacy settings',
    description: 'Hide your online status or read receipts, block people and report abuse.',
  },
  {
    icon: Pencil,
    title: 'Edit and react',
    description: 'Edit a message for 15 minutes after sending, react to it, or search the chat.',
  },
  {
    icon: Globe2,
    title: 'Works on any screen',
    description: 'Responsive on phone and desktop, with light and dark themes.',
  },
];

const STATS = [
  { value: '15 min', label: 'to edit a sent message' },
  { value: '5 MB', label: 'per image upload' },
  { value: '11', label: 'real-time socket events' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create an account', description: 'Pick a username and a password.' },
  { icon: Search, title: 'Find people', description: 'Search by name to start a chat or a group.' },
  { icon: MessagesSquare, title: 'Start talking', description: 'Send messages, photos and reactions.' },
];

const STACK = ['React 19', 'Socket.io', 'Express 5', 'MongoDB', 'Tailwind v4', 'Vite', 'Cloudinary', 'JWT'];

// The demo plays these states in order, then loops.
const DEMO_STEPS = [
  { at: 400, show: 1 },
  { at: 1500, show: 1, typing: 'Marco' },
  { at: 3200, show: 2 },
  { at: 4300, show: 3, tick: 'sent' },
  { at: 5400, show: 3, tick: 'read' },
  { at: 7000, show: 3, tick: 'read', typing: 'Aisha' },
  { at: 8600, show: 4, tick: 'read' },
];
const DEMO_LOOP = 12000;

const MESSAGES = [
  { name: 'Aisha', text: 'Pushed the new build' },
  { name: 'Marco', text: 'Testing it now, looks good' },
  { name: 'me', text: 'Sockets fixed the delay' },
  { name: 'Aisha', text: 'Shipping it tonight' },
];

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const Initial = ({ name }) => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
    {name[0]}
  </span>
);

const ChatDemo = () => {
  const [state, setState] = useState(() => (reducedMotion() ? DEMO_STEPS.at(-1) : { show: 0 }));

  useEffect(() => {
    if (reducedMotion()) return undefined;
    let timers = [];
    const run = () => {
      setState({ show: 0 });
      timers = DEMO_STEPS.map((s) => setTimeout(() => setState(s), s.at));
      timers.push(setTimeout(run, DEMO_LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      role="img"
      aria-label="Preview of a group chat with a typing indicator and read receipts"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">launch-team</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {state.typing ? `${state.typing} is typing…` : '3 members'}
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />3 online
        </span>
      </div>

      <div className="flex h-80 flex-col justify-end gap-3 p-5">
        {MESSAGES.slice(0, state.show).map((m, i) =>
          m.name === 'me' ? (
            <div key={i} className="lp-in flex flex-col items-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm text-white">{m.text}</div>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                {state.tick === 'read' ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" /> Read
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" /> Delivered
                  </>
                )}
              </span>
            </div>
          ) : (
            <div key={i} className="lp-in flex items-end gap-2">
              <Initial name={m.name} />
              <div className="max-w-[78%]">
                <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">{m.name}</p>
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                  {m.text}
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-400 dark:bg-gray-800">Message</div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner fullPage size="lg" />;
  if (isAuthenticated) return <Navigate to={ROUTES.CHAT} replace />;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Only animation on the page: new demo messages fade in. */}
      <style>{`
        .lp-in { animation: lp-in .25s ease-out both }
        @keyframes lp-in { from { opacity: 0; transform: translateY(4px) } }
      `}</style>

      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 font-medium">
            <MessagesSquare className="h-5 w-5 text-brand-600" aria-hidden="true" />
            Chatty
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#features" className="hidden text-gray-600 hover:text-gray-900 md:inline dark:text-gray-400 dark:hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="hidden text-gray-600 hover:text-gray-900 md:inline dark:text-gray-400 dark:hover:text-white">
              How it works
            </a>
            <Link to={ROUTES.LOGIN} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="hidden rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700 sm:inline-flex"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Direct and group chat that updates live
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
              Send messages and photos, see who is typing and when your message was read. Built with React, Express,
              MongoDB and Socket.io.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Create an account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                Sign in
              </Link>
            </div>
          </div>
          <ChatDemo />
        </section>

        <section aria-label="Built with" className="border-y border-gray-200 py-5 dark:border-gray-800">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 px-4 text-sm text-gray-500 dark:text-gray-400">
            {STACK.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section aria-label="Limits" className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white px-6 py-6 dark:bg-gray-950">
                <dt className="text-sm text-gray-500 dark:text-gray-400">{s.label}</dt>
                <dd className="mt-1 text-3xl font-medium tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="features" aria-labelledby="featuresHeading" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="featuresHeading" className="text-3xl font-semibold tracking-tight">
            What it does
          </h2>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <h3 className="mt-3 font-medium">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="stepsHeading"
          className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <h2 id="stepsHeading" className="text-3xl font-semibold tracking-tight">
              How it works
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, description }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-medium">
                      <span className="mr-2 text-gray-400 tabular-nums">{i + 1}</span>
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Try it with a friend</h2>
          <div className="flex gap-3">
            <Link
              to={ROUTES.REGISTER}
              className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Create an account
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <Footer className="border-t border-gray-200 dark:border-gray-800" />
    </div>
  );
};

export default LandingPage;
