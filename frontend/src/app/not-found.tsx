import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 transition-colors duration-300">
      <div className="w-full max-w-md text-center">
        {/* Logo mark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-8">
          <span className="text-white text-xl font-bold tracking-tight">HR</span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-slate-900/60 border border-gray-200 dark:border-slate-700 px-8 py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 mb-5">
            <Compass className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>

          <p className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">404</p>
          <h1 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            This page hasn't clocked in yet
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            The page you're looking for doesn't exist or may have moved.
          </p>

          <Link
            href="/dashboard"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-medium shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          Contact your HR administrator if this seems wrong.
        </p>
      </div>
    </div>
  );
}
