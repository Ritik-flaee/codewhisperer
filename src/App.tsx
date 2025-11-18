/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Sparkles, Loader2, Download, Share2, Sun, Moon, Code2, Mic, MicOff, Globe } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

// Read API key from Vite environment variables. If not set, some features will
// show a helpful message instead of calling the remote API.
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

// Supported languages for syntax highlighting and friendly labels.
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

// Initial placeholder shown in the code textarea.
const DEFAULT_CODE = `// Say something like: "Create a function that reverses a string in JavaScript"`;

function App() {
  // Read and write URL search params so the app state is shareable via URL.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCode = searchParams.get("code");
  const urlLang = searchParams.get("lang") || "typescript";

  // Main UI state
  const [code, setCode] = useState(urlCode ? decodeURIComponent(urlCode) : DEFAULT_CODE);
  const [language, setLanguage] = useState(urlLang);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false); // briefly shows "Copied!"
  const [darkMode, setDarkMode] = useState(true);
  const [listening, setListening] = useState(false); // speech recognition state
  const recognitionRef = useRef<any>(null); // holds the browser SpeechRecognition instance

  // debounce user typing so we don't update the URL on every keystroke
  const [debouncedCode] = useDebounce(code, 600);

  // When the debounced code or language changes, persist them to the URL so
  // the current state can be shared via link.
  useEffect(() => {
    if (debouncedCode && debouncedCode !== DEFAULT_CODE) {
      setSearchParams({ code: encodeURIComponent(debouncedCode), lang: language });
    }
  }, [debouncedCode, language, setSearchParams]);

  // Initialize darkMode based on OS/browser preference.
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  // Toggle the 'dark' class on the document root so Tailwind can apply dark
  // theme styles. This reflects the `darkMode` state in the DOM.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Voice Input: try to create a SpeechRecognition instance if the browser
  // supports it. We set up handlers to append transcribed text to the code
  // textarea.
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        // Combine results into a single transcript string
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        // If the textarea still contains the DEFAULT_CODE placeholder, replace
        // it with the transcript. Otherwise, append the transcribed text.
        setCode(prev => prev === DEFAULT_CODE ? transcript : prev + " " + transcript);
      };

      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  // Start/stop voice recognition. This toggles the listening state and calls
  // the underlying SpeechRecognition API.
  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  // Utility: copy text to clipboard and show a temporary UI indicator.
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy a shareable link (current URL) to the clipboard.
  const shareLink = () => {
    const url = window.location.href;
    copyToClipboard(url);
  };

  // Export the current code + explanation as a Markdown file and trigger a
  // download in the browser.
  const exportMarkdown = () => {
    const md = `# CodeWhisperer Explanation\n\nLanguage: ${LANGUAGES[language as keyof typeof LANGUAGES]?.name}\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n## Explanation\n\n${explanation}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codewhisperer-explanation.md";
    a.click();
  };

  // Main action: call the OpenRouter / Chat Completions API to get an
  // explanation of the provided code. We do minimal error handling and
  // surface guidance if the API key is missing.
  const explainCode = async () => {
    if (!code.trim()) return; // don't call API with empty code
    setLoading(true);
    setExplanation("");

    if (!OPENROUTER_KEY) {
      setExplanation("Missing API key. Add VITE_OPENROUTER_API_KEY to .env.local");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
            { role: "system", content: `You are an expert ${LANGUAGES[language as keyof typeof LANGUAGES]?.name || "programming"} teacher. Explain clearly in bullet points.` },
            { role: "user", content: `Explain this ${language} code:\n\n${code}` },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      // We assume the API returns a standard `choices` array with a message
      // containing the assistant's content. If the provider changes shape,
      // this may need updating.
      setExplanation(data.choices[0].message.content);
    } catch (err) {
      // Log the error for debugging while showing a user-friendly message
      // in the UI. Keeping the console call avoids an "unused variable"
      // lint error and provides useful runtime information.
      console.error(err);
      setExplanation("Error: Check API key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? "from-slate-900 via-purple-900 to-slate-900" : "from-purple-100 via-pink-100 to-purple-100"} transition-all duration-500`}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold mb-4 flex items-center justify-center gap-4">
            <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />
            CodeWhisperer
            <Globe className="w-12 h-12 text-pink-400" />
          </h1>
          <p className="text-2xl opacity-90">Talk to code • Get instant AI explanations</p>

          <div className="flex justify-center gap-4 mt-10 flex-wrap">
            {/* Language selector (updates `language` state) */}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur border border-purple-500/50">
              {Object.entries(LANGUAGES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>

            {/* Toggle theme */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-4 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20">
              {darkMode ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
            </button>

            {/* Voice control (if supported) */}
            <button onClick={toggleVoice} className={`p-4 rounded-2xl backdrop-blur transition ${listening ? "bg-red-500/80 animate-pulse" : "bg-white/10 hover:bg-white/20"}`}>
              {listening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            {/* Share/Export options appear once an explanation exists */}
            {explanation && (
              <>
                <button onClick={shareLink} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20">
                  <Share2 /> Share Link
                </button>
                <button onClick={exportMarkdown} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20">
                  <Download /> Markdown
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          {/* Left column: input area */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl">
              <div className="bg-purple-900/60 px-8 py-5 flex justify-between items-center">
                <span className="text-xl font-bold flex items-center gap-3">
                  <Code2 className="w-6 h-6" /> Your Code
                </span>
                <button onClick={() => copyToClipboard(code)} className="flex items-center gap-2 px-5 py-3 bg-white/10 rounded-xl hover:bg-white/20">
                  <Copy className="w-5 h-5" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {/* Code input textarea. Keep spellCheck off for code. */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-black/70 text-white font-mono text-base p-8 outline-none resize-none"
                spellCheck={false}
                placeholder="Paste code or press mic to speak..."
              />
            </div>

            {/* Primary action to request an explanation from the AI */}
            <button
              onClick={explainCode}
              disabled={loading || !code.trim()}
              className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-3xl font-bold text-2xl shadow-2xl transform hover:scale-105 transition-all disabled:scale-100 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
              {loading ? "Thinking..." : "Explain This Code"}
            </button>
          </div>

          {/* Right column: explanation and syntax-highlighted code */}
          <div className="space-y-6">
            {explanation ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-8 shadow-2xl">
                {/* The API response is displayed as preformatted text */}
                <pre className="whitespace-pre-wrap text-xl leading-relaxed font-medium">{explanation}</pre>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-dashed border-purple-500/50 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-24 h-24 mx-auto mb-6 opacity-30" />
                  <p className="text-2xl opacity-70">Press mic or paste code → magic happens</p>
                </div>
              </div>
            )}

            {/* Syntax highlighted view of the current code */}
            <SyntaxHighlighter
              language={LANGUAGES[language as keyof typeof LANGUAGES]?.prism || "text"}
              style={darkMode ? vscDarkPlus : tomorrow}
              customStyle={{ borderRadius: "24px", padding: "2rem", fontSize: "16px" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;