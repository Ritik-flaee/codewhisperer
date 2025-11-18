/* ========================================================================= */
/*  CodeWhisperer – AI Code Generator + Explainer                            */
/*  Built by Ritik[](https://github.com/Ritik-flaee)                          */
/* ========================================================================= */

import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy, Sparkles, Loader2, Download, Share2, Sun, Moon,
  Mic, MicOff, Wand2, BookOpen
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

const LANGUAGES = {
  javascript: { name: "JavaScript", prism: "javascript" },
  typescript: { name: "TypeScript", prism: "typescript" },
  python: { name: "Python", prism: "python" },
  rust: { name: "Rust", prism: "rust" },
  go: { name: "Go", prism: "go" },
  java: { name: "Java", prism: "java" },
  cpp: { name: "C++", prism: "cpp" },
  ruby: { name: "Ruby", prism: "ruby" },
  html: { name: "HTML", prism: "markup" },
};

const DEFAULT_PROMPT = `Ask me anything, like:\n"Create a debounce hook in React"\n"Explain this Python list comprehension"\n"Write a FastAPI endpoint"`;

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCode = searchParams.get("code");
  const urlLang = searchParams.get("lang") || "typescript";
  const urlMode = searchParams.get("mode") || "generate";

  const [input, setInput] = useState(urlCode ? decodeURIComponent(urlCode) : DEFAULT_PROMPT);
  const [language, setLanguage] = useState(urlLang);
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"generate" | "explain">(urlMode === "explain" ? "explain" : "generate");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [debouncedInput] = useDebounce(input, 600);

  useEffect(() => {
    if (debouncedInput && debouncedInput !== DEFAULT_PROMPT) {
      setSearchParams({ code: encodeURIComponent(debouncedInput), lang: language, mode });
    }
  }, [debouncedInput, language, mode, setSearchParams]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const hasCode = /[{};=()[\]]|function|const|let|var|=>|class|def|import|export/.test(input);
    const wantsGenerate = /write|create|build|make|generate|code for/i.test(input);
    if (wantsGenerate || !hasCode) setMode("generate");
    else setMode("explain");
  }, [input]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setInput(prev => prev === DEFAULT_PROMPT ? transcript : prev + " " + transcript);
      };

      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  const toggleVoice = () => {
    listening ? recognitionRef.current?.stop() : recognitionRef.current?.start();
    setListening(!listening);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => copyToClipboard(window.location.href);

  const exportMarkdown = () => {
    const title = mode === "generate" ? "Generated Code" : "Code Explanation";
    const md = `# CodeWhisperer – ${title}\n\n**Language:** ${LANGUAGES[language as keyof typeof LANGUAGES]?.name}\n\n\`\`\`${language}\n${mode === "generate" ? output : input}\n\`\`\`\n\n**Prompt:**\n${input}\n\n${mode === "explain" ? `**Explanation:**\n\n${output}` : ""}\n\n---\nMade with love by [Ritik](https://github.com/Ritik-flaee)`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codewhisperer-${mode}.md`;
    a.click();
  };

  const runAI = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");

    if (!OPENROUTER_KEY) {
      setOutput("Missing API key → Add VITE_OPENROUTER_API_KEY in .env.local");
      setLoading(false);
      return;
    }

    const systemPrompt = mode === "generate"
      ? `You are a senior ${LANGUAGES[language as keyof typeof LANGUAGES]?.name} developer. Write clean, modern code. Add minimal comments only if needed. No explanations.`
      : `You are an expert teacher. Explain code clearly using bullet points and simple language. Never write code.`;

    const userPrompt = mode === "generate"
      ? `Write this in ${LANGUAGES[language as keyof typeof LANGUAGES]?.name}:\n\n${input}`
      : `Explain this ${language} code:\n\n${input}`;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "CodeWhisperer",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: mode === "generate" ? 0.3 : 0.7,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setOutput(data.choices[0].message.content);
    } catch {
      setOutput("Error: Check your API key or internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? "from-slate-900 via-purple-900 to-slate-900" : "from-purple-50 via-pink-50 to-purple-50"} transition-all duration-500`}>
      <div className="container mx-auto p-6 max-w-7xl">

        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-6">
            <Sparkles className="w-20 h-20" />
            CodeWhisperer
            <Sparkles className="w-20 h-20" />
          </h1>
          <p className="text-2xl font-medium opacity-80 mb-10">Generate • Explain • Speak • Share</p>

          {/* Top Controls */}
          <div className="flex justify-center gap-6 flex-wrap mb-10">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-8 py-5 rounded-3xl bg-white/10 backdrop-blur border border-purple-500/50 text-lg font-medium">
              {Object.entries(LANGUAGES).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>

            <button onClick={() => setDarkMode(!darkMode)} className="p-5 rounded-3xl bg-white/10 backdrop-blur hover:bg-white/20">
              {darkMode ? <Sun className="w-9 h-9" /> : <Moon className="w-9 h-9" />}
            </button>

            <button onClick={toggleVoice}
              className={`p-5 rounded-3xl backdrop-blur transition ${listening ? "bg-red-600 animate-pulse" : "bg-white/10 hover:bg-white/20"}`}>
              {listening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>

            {output && (
              <>
                <button onClick={shareLink} className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-white/10 backdrop-blur hover:bg-white/20">
                  <Share2 className="w-7 h-7" /> Share
                </button>
                <button onClick={exportMarkdown} className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-white/10 backdrop-blur hover:bg-white/20">
                  <Download className="w-7 h-7" /> Markdown
                </button>
              </>
            )}
          </div>

          {/* Made with love by Ritik — Clean & Perfect */}
          <p className="text-lg font-medium opacity-80">
            Made with{" "}
            <span className="text-red-500 text-2xl animate-pulse">love</span>{" "}
            by{" "}
            <a
              href="https://github.com/Ritik-flaee"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-purple-500 hover:text-purple-400 underline decoration-purple-300 underline-offset-4 transition-colors"
            >
              Ritik
            </a>
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-10 mt-16">

          {/* Input */}
          <div className="space-y-8">
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl border border-purple-500/40 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-800/80 to-pink-800/80 px-10 py-7 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  {mode === "generate" ? <Wand2 className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
                  <span className="text-3xl font-bold">
                    {mode === "generate" ? "What should I build?" : "Paste your code"}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setMode("generate")}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${mode === "generate" ? "bg-white text-black" : "bg-white/20"}`}>
                    Generate
                  </button>
                  <button onClick={() => setMode("explain")}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${mode === "explain" ? "bg-white text-black" : "bg-white/20"}`}>
                    Explain
                  </button>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 bg-black/70 text-white font-mono text-lg p-10 outline-none resize-none"
                spellCheck={false}
                placeholder={mode === "generate" ? "e.g. Create a React debounce hook" : "Paste your code here..."}
              />
            </div>

            <button
              onClick={runAI}
              disabled={loading || !input.trim()}
              className="w-full py-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-3xl font-black text-4xl shadow-2xl transform hover:scale-105 transition-all disabled:opacity-60 flex items-center justify-center gap-8"
            >
              {loading ? <Loader2 className="animate-spin w-16 h-16" /> : <Sparkles className="w-16 h-16" />}
              {loading ? "Working..." : mode === "generate" ? "Generate Code" : "Explain Code"}
            </button>
          </div>

          {/* Output */}
          <div className="space-y-10">
            {output ? (
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-purple-500/40 shadow-2xl p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-bold">{mode === "generate" ? "Generated Code" : "Explanation"}</h3>
                  <button onClick={() => copyToClipboard(output)}
                    className="flex items-center gap-4 px-8 py-4 bg-white/20 rounded-2xl hover:bg-white/30 transition">
                    <Copy className="w-7 h-7" /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {mode === "generate" ? (
                  <SyntaxHighlighter
                    language={LANGUAGES[language as keyof typeof LANGUAGES]?.prism || "text"}
                    style={darkMode ? vscDarkPlus : tomorrow}
                    customStyle={{ borderRadius: "20px", padding: "2.5rem", fontSize: "18px" }}
                  >
                    {output}
                  </SyntaxHighlighter>
                ) : (
                  <pre className="whitespace-pre-wrap text-xl leading-relaxed font-medium">{output}</pre>
                )}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-dashed border-purple-500/50 h-96 flex items-center justify-center text-center p-12">
                <div>
                  <Sparkles className="w-32 h-32 mx-auto mb-10 opacity-20" />
                  <p className="text-3xl opacity-70">Your AI result will appear here...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;