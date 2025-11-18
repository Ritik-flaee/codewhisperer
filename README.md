# CodeWhisperer

Small Vite + React + TypeScript app that explains code using an LLM-powered API.

What this repo contains
- A React app (TypeScript) using Vite and Tailwind for styling.
- Voice input via the browser SpeechRecognition API (when available).
- Integration with OpenRouter-style chat completions (configured via env).

Quick start

1. Install dependencies

```powershell
npm install
```

2. Add environment variables

Create a `.env.local` file in the project root (or set env vars in your shell):

```
VITE_OPENROUTER_API_KEY=your_api_key_here
```

The key is optional for local dev, but the Explain action will show a message
if it is missing.

3. Run development server

```powershell
npm run dev
```

Build & preview

```powershell
npm run build
npm run preview
```

Notes
- The app updates the URL with `code` and `lang` query params so you can share
  a specific example with others.
- Voice input uses the browser's built-in speech recognition (Chrome-based
  browsers expose `webkitSpeechRecognition`). If the API is not available the
  mic button will be present but will not start recording.
- The project includes TypeScript and an ESLint configuration. Run

```powershell
npm run lint
```

to check lint issues.

License

This is provided as-is. Adjust per your needs.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
