import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Paper } from '../types';
import { 
  FileText, 
  ArrowLeft, 
  BookOpen, 
  MessageSquare, 
  BarChart, 
  ChevronRight,
  Send,
  AlertCircle,
  Cpu,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Custom lightweight parser to render standard markdown syntax in styled HTML safely
const MiniMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div className="space-y-3 font-sans text-sm text-[#e0e0e0] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Header 3
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="text-base font-bold text-white tracking-tight pt-3 border-b border-[#262626] pb-1 font-sans">
              {trimmed.replace('###', '').trim()}
            </h4>
          );
        }
        // Header 4
        if (trimmed.startsWith('####')) {
          return (
            <h5 key={idx} className="text-sm font-semibold text-blue-400 tracking-wide pt-2 font-mono">
              {trimmed.replace('####', '').trim()}
            </h5>
          );
        }
        // Bullet list
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[•\-*]\s*/, '');
          // Simple bold parser inside bullet points
          return (
            <li key={idx} className="list-disc list-inside pl-2 text-xs text-[#c6c6c6] font-light">
              <span dangerouslySetInnerHTML={{ 
                __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') 
              }} />
            </li>
          );
        }
        // Numbered list
        if (/^\d+\./.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={idx} className="pl-4 text-xs text-[#c6c6c6] font-light flex gap-2">
              <span className="font-mono text-blue-400 font-semibold">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span dangerouslySetInnerHTML={{ 
                __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') 
              }} />
            </div>
          );
        }
        // Empty lines
        if (trimmed === '') {
          return <div key={idx} className="h-1.5" />;
        }
        // Bold parsing for standard lines
        return (
          <p key={idx} className="text-xs text-[#c6c6c6] font-light" dangerouslySetInnerHTML={{ 
            __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') 
          }} />
        );
      })}
    </div>
  );
};

export const PaperDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = () => {
    if (location.pathname.endsWith('/summary')) return 'summary';
    if (location.pathname.endsWith('/ask')) return 'qa';
    if (location.pathname.endsWith('/insights')) return 'insights';
    return 'summary';
  };

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'qa' | 'insights'>(getTabFromPath());

  const handleTabChange = (tab: 'summary' | 'qa' | 'insights') => {
    setActiveTab(tab);
    if (tab === 'summary') navigate(`/papers/${id}/summary`);
    else if (tab === 'qa') navigate(`/papers/${id}/ask`);
    else if (tab === 'insights') navigate(`/papers/${id}/insights`);
  };

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Summary generation states
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Q&A states
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<{ q: string; a: string; timestamp: Date }[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Insights generation states
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/papers/${id}`);
      setPaper(response.data.paper);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load research paper details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaperDetails();
  }, [id]);

  useEffect(() => {
    // Scroll chat history to bottom whenever Q&A updates
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [qaHistory, qaLoading]);

  const handleGenerateSummary = async () => {
    if (!paper) return;
    try {
      setSummaryLoading(true);
      setError(null);
      const response = await api.post(`/papers/${paper.id}/summary`);
      setPaper((prev) => prev ? { ...prev, summary: response.data.summary, has_summary: true } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Summary extraction failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!paper) return;
    try {
      setInsightsLoading(true);
      setError(null);
      const response = await api.post(`/papers/${paper.id}/insights`);
      setPaper((prev) => prev ? { ...prev, insights: response.data.insights, has_insights: true } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Insights extraction failed');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const activeQuestion = customQ || question;
    if (!activeQuestion.trim() || !paper) return;

    const currentQ = activeQuestion.trim();
    if (!customQ) setQuestion(''); // clear normal inputs
    setQaLoading(true);

    try {
      const response = await api.post(`/papers/${paper.id}/ask`, { question: currentQ });
      setQaHistory((prev) => [...prev, { q: currentQ, a: response.data.answer, timestamp: new Date() }]);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to receive answer');
    } finally {
      setQaLoading(false);
    }
  };

  // Helper sample questions for quick onboarding
  const sampleQuestions = [
    "What is the primary contribution of this research?",
    "Detail the experimental methodologies used.",
    "What are the main limitations specified in the document?"
  ];

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent border-blue-600 mx-auto"></div>
        <p className="font-mono text-xs text-[#a8a8a8]">CONSTRUCTING ACADEMIC CANVAS INTERFACES...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-md mx-auto rounded bg-red-950/10 border border-red-800 p-6 text-center space-y-4">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-white">System Error</h3>
          <p className="text-xs text-[#a8a8a8] mt-1">{error || 'The requested research paper could not be found.'}</p>
        </div>
        <Link to="/dashboard" className="inline-block text-xs font-semibold text-blue-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to library & paper info header */}
      <div className="space-y-4">
        <Link to="/papers" className="inline-flex items-center gap-1.5 text-xs text-[#a8a8a8] hover:text-white transition-all">
          <ArrowLeft size={12} />
          Back to library
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#161616] border border-[#393939] p-5 rounded-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-blue-950/40 border border-blue-900 rounded-sm">
            <FileText className="text-blue-400" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-neutral-800 text-[10px] font-mono px-2 py-0.5 text-[#8d8d8d] uppercase">PDF Ingestion Board</span>
              <span className="font-mono text-[10px] text-blue-400">ID: #{paper.id}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">{paper.title}</h2>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#393939] bg-[#161616] p-1 rounded-sm gap-1">
        <button
          onClick={() => handleTabChange('summary')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white'
              : 'text-[#a8a8a8] hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          Executive Summary
        </button>
        <button
          onClick={() => handleTabChange('qa')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
            activeTab === 'qa'
              ? 'bg-blue-600 text-white'
              : 'text-[#a8a8a8] hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          IBM Granite Q&A
        </button>
        <button
          onClick={() => handleTabChange('insights')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-blue-600 text-white'
              : 'text-[#a8a8a8] hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <BarChart size={14} />
          Opportunities Insights
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded bg-[#161616] border border-[#393939] p-6 min-h-[350px] flex flex-col justify-between">
        
        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            {paper.summary ? (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-400">
                    <Sparkles size={14} />
                    <span>IBM Granite Synthesis</span>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="flex items-center gap-1.5 text-xs text-[#a8a8a8] hover:text-white cursor-pointer"
                    title="Regenerate summary content"
                  >
                    <RefreshCw size={11} className={summaryLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <MiniMarkdownRenderer text={paper.summary} />
              </div>
            ) : (
              <div className="text-center py-12 max-w-md mx-auto space-y-6 flex-1 flex flex-col justify-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-blue-950/30 border border-blue-900 rounded-sm">
                  <Sparkles className="text-blue-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Generate Document Summary</h4>
                  <p className="text-xs text-[#a8a8a8] mt-1.5 leading-relaxed">
                    Trigger the local parser and IBM Granite layers to map abstract definitions, research context, and methodological objectives.
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="inline-flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 px-5 py-3 text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
                  >
                    {summaryLoading ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Generating Summary Parameters...
                      </>
                    ) : (
                      <>
                        <Cpu size={14} />
                        Synthesize with IBM Granite
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IBM GRANITE Q&A CHAT */}
        {activeTab === 'qa' && (
          <div className="flex flex-col h-[500px] justify-between">
            {/* QA Log frame */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 border-b border-[#262626] pb-4 mb-4">
              {qaHistory.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto space-y-5 py-6">
                  <div className="h-10 w-10 flex items-center justify-center bg-neutral-900 border border-[#393939] rounded-sm">
                    <MessageSquare size={18} className="text-[#8d8d8d]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Ask your publication questions</h4>
                    <p className="text-xs text-[#a8a8a8] mt-1.5 leading-relaxed">
                      Type custom queries about this paper below. Or select one of the following frequently asked literature review prompts to query:
                    </p>
                  </div>
                  
                  {/* Sample prompt triggers */}
                  <div className="w-full space-y-2">
                    {sampleQuestions.map((qText, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={(e) => handleAskQuestion(e, qText)}
                        disabled={qaLoading}
                        className="w-full text-left p-2.5 rounded-sm bg-neutral-900 border border-[#393939] text-xs text-[#e0e0e0] hover:border-blue-600 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                      >
                        <span className="truncate pr-4">{qText}</span>
                        <ChevronRight size={12} className="text-[#8d8d8d] group-hover:text-blue-400 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {qaHistory.map((item, qIdx) => (
                    <div key={qIdx} className="space-y-3">
                      {/* User question */}
                      <div className="flex justify-end">
                        <div className="bg-neutral-800 border border-neutral-700 text-[#e0e0e0] px-4 py-2.5 rounded-sm max-w-[85%] text-xs font-sans">
                          <span className="block text-[9px] font-mono text-[#8d8d8d] uppercase tracking-wider mb-0.5">Researcher Query</span>
                          {item.q}
                        </div>
                      </div>

                      {/* Granite response */}
                      <div className="flex justify-start">
                        <div className="bg-blue-950/20 border border-blue-900/40 text-white p-4 rounded-sm max-w-[85%] text-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-blue-400 uppercase tracking-wider mb-1">
                            <Cpu size={10} />
                            <span>IBM Granite Assistant</span>
                          </div>
                          <MiniMarkdownRenderer text={item.a} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing loader */}
                  {qaLoading && (
                    <div className="flex justify-start">
                      <div className="bg-blue-950/10 border border-neutral-800 p-3 rounded-sm max-w-[80%] text-xs text-[#a8a8a8] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" />
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="font-mono text-[10px] ml-1">Granite reasoning in progress...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2.5">
              <input
                type="text"
                placeholder="Query equations, contributions, metrics, or limitations..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={qaLoading}
                className="flex-1 bg-neutral-900 border border-[#393939] focus:border-blue-600 px-3 py-3 text-xs text-white placeholder-neutral-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={qaLoading || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 text-white px-5 rounded-sm flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Send query"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: RESEARCH OPPORTUNITIES INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            {paper.insights ? (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-400">
                    <BarChart size={14} />
                    <span>IBM Granite Academic SWOT</span>
                  </div>
                  <button
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    className="flex items-center gap-1.5 text-xs text-[#a8a8a8] hover:text-white cursor-pointer"
                    title="Regenerate analytical SWOT metrics"
                  >
                    <RefreshCw size={11} className={insightsLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                <MiniMarkdownRenderer text={paper.insights} />
              </div>
            ) : (
              <div className="text-center py-12 max-w-md mx-auto space-y-6 flex-1 flex flex-col justify-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-purple-950/30 border border-purple-900 rounded-sm">
                  <BarChart className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Generate Research Insights</h4>
                  <p className="text-xs text-[#a8a8a8] mt-1.5 leading-relaxed">
                    Trigger the Granite service to perform analytical assessments, highlighting scholarly contribution, technological constraints, and recommended action plans.
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    className="inline-flex items-center gap-2 rounded-sm bg-purple-600 hover:bg-purple-700 px-5 py-3 text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
                  >
                    {insightsLoading ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Formulating Insight Metrics...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Analyze with IBM Granite
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
