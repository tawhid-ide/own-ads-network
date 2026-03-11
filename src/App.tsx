import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  Languages, 
  Clock, 
  FileText, 
  Loader2, 
  Copy, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [url, setUrl] = useState('');
  const [videoType, setVideoType] = useState<'short' | 'long'>('long');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processedTranscript, setProcessedTranscript] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
  ];

  const handleFetchTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setTranscript('');
    setProcessedTranscript('');

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, language }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      setTranscript(data.transcript);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processWithAI = async () => {
    if (!transcript) return;
    
    setProcessingAI(true);
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are an expert editor. I will provide a raw YouTube transcript.
          Please format it into a clean, readable article or summary.
          - Add a title.
          - Use proper paragraphs and punctuation.
          - Use bullet points for key takeaways if applicable.
          - Maintain the original meaning and language (${languages.find(l => l.code === language)?.name}).
          - If it's a "short" video, keep it concise. If it's "long", provide more detail.
          
          Video Type: ${videoType}
          Transcript: ${transcript}
        `,
      });
      
      setProcessedTranscript(result.text || '');
    } catch (err: any) {
      console.error("AI Processing error:", err);
      setError("AI processing failed, but you still have the raw transcript below.");
    } finally {
      setProcessingAI(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Youtube size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Transcribe<span className="text-orange-500">AI</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">How it works</a>
            <a href="#" className="hover:text-black transition-colors">Pricing</a>
            <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition-all">Get Started</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              Powered by Gemini AI
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tighter mb-6">
              Turn any video into <span className="text-orange-500 italic">perfect</span> text.
            </h2>
            <p className="text-lg text-black/50 mb-10 max-w-md leading-relaxed">
              Paste a YouTube URL and get a clean, formatted transcript in seconds. Perfect for creators, students, and researchers.
            </p>

            <form onSubmit={handleFetchTranscript} className="space-y-6 bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                  <Youtube size={14} />
                  YouTube Video URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-4 rounded-2xl bg-black/5 border-transparent focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-lg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Clock size={14} />
                    Video Type
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-black/5 border-transparent focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value as any)}
                  >
                    <option value="long">Long Video</option>
                    <option value="short">Short / Reel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Languages size={14} />
                    Language
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl bg-black/5 border-transparent focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Extracting...
                  </>
                ) : (
                  <>
                    Get Transcript
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Results */}
          <div className="lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              {!transcript && !loading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[500px] rounded-3xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-black/20 mb-6">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No transcript yet</h3>
                  <p className="text-black/40 max-w-xs">Enter a YouTube URL on the left to start processing your video.</p>
                </motion.div>
              )}

              {transcript && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* AI Action Card */}
                  {!processedTranscript && (
                    <div className="bg-black text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <Sparkles className="text-orange-400" size={24} />
                          Enhance with AI
                        </h3>
                        <p className="text-white/60 mb-6">
                          The raw transcript is ready. Want Gemini to format it into a clean, readable summary?
                        </p>
                        <button 
                          onClick={processWithAI}
                          disabled={processingAI}
                          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {processingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                          {processingAI ? 'Processing...' : 'Format with AI'}
                        </button>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    </div>
                  )}

                  {/* Transcript Display */}
                  <div className="bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden flex flex-col max-h-[600px]">
                    <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-black/40">
                          {processedTranscript ? 'AI Formatted' : 'Raw Transcript'}
                        </span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(processedTranscript || transcript)}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors text-black/40 hover:text-black flex items-center gap-2 text-xs font-bold"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-8 overflow-y-auto custom-scrollbar">
                      <div className="prose prose-orange max-w-none">
                        {processedTranscript ? (
                          <div className="whitespace-pre-wrap text-lg leading-relaxed text-black/80">
                            {processedTranscript}
                          </div>
                        ) : (
                          <p className="text-black/60 leading-relaxed italic">
                            {transcript}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-black/40 font-medium">
        <p>© 2026 TranscribeAI. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}} />
    </div>
  );
}
