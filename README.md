# CodeWhisperer

**AI-powered code explainer with voice input, live sharing, dark mode, and PWA support**  
Built in < 2 hours with React 19 + TypeScript + Tailwind + OpenRouter

**Live Demo** → [https://codewhisperer-ritz.vercel.app/]

https://github.com/user-attachments/assets/YOUR_SCREENSHOT_OR_GIF_HERE  
*(Add a beautiful screenshot or Loom GIF after deploy — I recommend recording the mic + explanation flow)*

## Features

- **Instant AI explanations** using OpenRouter (Gemini Flash, Claude, Llama — free tier)
- **Voice input** — just press the mic and speak your code or idea
- **Language selector** — JavaScript, TypeScript, Python, Rust, Go, Java, C++, Ruby, HTML
- **Shareable links** — URL auto-updates with your code + language
- **Export as Markdown** — perfect for notes, blogs, or documentation
- **Dark / Light mode toggle**
- **PWA ready** — install as a desktop/mobile app
- **Live syntax-highlighted preview**
- **100% client-side** — no backend needed

## Tech Stack

| Category       | Tech                                                                 |
|---------------|----------------------------------------------------------------------|
| Framework     | React 19 + TypeScript + Vite                                         |
| Styling       | Tailwind CSS + glassmorphism + gradient magic                        |
| AI            | OpenRouter (Gemini 2.5 Flash — free & fast)                          |
| Voice         | Web Speech API (Chrome/Edge)                                         |
| Icons         | Lucide React                                                         |
| Syntax        | react-syntax-highlighter                                            |
| Deploy        | Vercel (free, instant)                                               |
| PWA           | vite-plugin-pwa                                                      |

## Quick Start

```bash
git clone https://github.com/Ritik-flaee/codewhisperer.git
cd codewhisperer
npm install
```

Create `.env.local`:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

```bash
npm run dev
```

→ Open [http://localhost:5173](http://localhost:5173)

## Deploy Your Own (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ritik-flaee/codewhisperer)

Just connect your GitHub → add your `VITE_OPENROUTER_API_KEY` → deploy!

## Try It Now (Examples)

- Paste any code → click "Explain This Code"
- Press the mic → say: *"Write a Python function to reverse a string"*
- Change language → see instant syntax highlighting
- Click "Share Link" → send to a friend

## Local Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Test production build
npm run lint       # ESLint check
```

## PWA Installation

After deploying:
- Open in Chrome/Edge
- Click "Install CodeWhisperer" in the address bar
- Now it's a real app on your phone/desktop!

## License

MIT © [Ritik](https://github.com/Ritik-flaee) — Feel free to fork, star, and use in your portfolio!

---

**Built live with Grok in under 2 hours**  
*Yes, this entire app was created interactively with AI — the future is here.*

---

**Made with passion by Ritik**  
[GitHub](https://github.com/Ritik-flaee) • [LinkedIn](https://www.linkedin.com/in/ritikawachat/) • ritikawachat@gmail.com
