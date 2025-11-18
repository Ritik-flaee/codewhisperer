// Entrypoint for the React application. This file boots the app and mounts
// the React component tree into the DOM element with id="root".
//
// Notes:
// - This project uses Vite + React + TypeScript. Vite serves the module
//   bundle and handles hot module replacement during development.
// - We wrap the app in React.StrictMode to highlight potential problems in
//   development. It does not affect production behavior besides additional
//   checks in development builds.
// - BrowserRouter is used to provide client-side routing support via
//   react-router-dom. Remove or replace if you don't need routing.

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // Root app component
import "./index.css"; // Global styles (Tailwind + custom CSS)

// Find the root DOM node created in `index.html` and mount React there.
// The non-null assertion (!) is safe because `index.html` provides an element
// with id="root". If you remove that div, this call will throw at runtime.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);