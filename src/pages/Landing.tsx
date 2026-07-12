import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, ArrowRight, Upload, BookOpen, MessageSquare, BarChart } from 'lucide-react';
import { motion } from 'motion/react';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="ibm-grid-bg min-h-full flex flex-col justify-between -m-4 sm:-m-8 p-6 sm:p-12 text-white">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex h-16 w-16 items-center justify-center bg-blue-600 rounded-lg shadow-xl shadow-blue-900/30"
        >
          <Cpu size={32} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight"
        >
          ResearchPilot <span className="text-blue-500 font-mono font-bold">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-base sm:text-xl text-[#c6c6c6] max-w-2xl font-light"
        >
          AI-Powered Research Assistant using IBM Granite. Accelerate academic literature review, ask complex questions, and extract structured analytical insights from PDFs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-sm bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/40 transition-all text-sm tracking-wide cursor-pointer"
            >
              Enter Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-sm bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/40 transition-all text-sm tracking-wide cursor-pointer"
              >
                Get Started (Free)
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-sm border border-[#393939] bg-[#161616] px-6 py-3 font-semibold text-[#e0e0e0] hover:bg-neutral-800 hover:border-neutral-700 transition-all text-sm tracking-wide cursor-pointer"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-6 py-12 border-t border-[#393939]/60">
        <div className="rounded bg-[#161616]/80 border border-[#393939] p-5">
          <div className="h-10 w-10 flex items-center justify-center bg-blue-950/40 border border-blue-900 rounded mb-4">
            <Upload className="text-blue-400" size={18} />
          </div>
          <h3 className="font-sans font-semibold text-base text-white">Smart Indexing</h3>
          <p className="mt-2 text-xs text-[#a8a8a8] leading-relaxed">
            Drag & drop raw PDFs. Our backend parses physical PDF buffers and indices full-text variables instantaneously.
          </p>
        </div>

        <div className="rounded bg-[#161616]/80 border border-[#393939] p-5">
          <div className="h-10 w-10 flex items-center justify-center bg-blue-950/40 border border-blue-900 rounded mb-4">
            <BookOpen className="text-blue-400" size={18} />
          </div>
          <h3 className="font-sans font-semibold text-base text-white">Automated Summaries</h3>
          <p className="mt-2 text-xs text-[#a8a8a8] leading-relaxed">
            Generate executive summaries and structured section overviews powered by advanced IBM Granite instructions.
          </p>
        </div>

        <div className="rounded bg-[#161616]/80 border border-[#393939] p-5">
          <div className="h-10 w-10 flex items-center justify-center bg-blue-950/40 border border-blue-900 rounded mb-4">
            <MessageSquare className="text-blue-400" size={18} />
          </div>
          <h3 className="font-sans font-semibold text-base text-white">Document Chat</h3>
          <p className="mt-2 text-xs text-[#a8a8a8] leading-relaxed">
            Interrogate your documents in real-time. Prompt questions, query definitions, and map theoretical equations.
          </p>
        </div>

        <div className="rounded bg-[#161616]/80 border border-[#393939] p-5">
          <div className="h-10 w-10 flex items-center justify-center bg-blue-950/40 border border-blue-900 rounded mb-4">
            <BarChart className="text-blue-400" size={18} />
          </div>
          <h3 className="font-sans font-semibold text-base text-white">Research Insights</h3>
          <p className="mt-2 text-xs text-[#a8a8a8] leading-relaxed">
            Extract structural gaps, academic limitations, and research opportunities instantly with custom-profiled analytics.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center font-mono text-[10px] text-[#8d8d8d] py-6 tracking-wider uppercase">
        ResearchPilot AI • Compiled with IBM Granite Blueprint and React
      </div>
    </div>
  );
};
