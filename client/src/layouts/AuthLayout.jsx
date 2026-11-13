import { Link, Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

import Footer from '../components/common/Footer.jsx';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gray-50 px-4 pt-10 dark:bg-gray-950">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
        <Link
          to="/chat"
          className="mb-6 flex items-center gap-2 text-brand-700 transition-opacity hover:opacity-80 dark:text-brand-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Chatty
          </span>
        </Link>

        <main className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer className="relative z-10 border-0 bg-transparent backdrop-blur-0 dark:bg-transparent" />
    </div>
  );
};

export default AuthLayout;
