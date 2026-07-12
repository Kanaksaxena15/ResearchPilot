import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center text-center">
      <div className="space-y-6 max-w-sm bg-[#161616] border border-[#393939] p-8 rounded shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-red-950/20 border border-red-800 rounded-sm">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-sans">Page Not Found</h3>
          <p className="text-xs text-[#a8a8a8] mt-1.5 leading-relaxed">
            The screen address you requested does not exist or has been relocated within the research cockpit.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white tracking-wide transition-all w-full cursor-pointer"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
