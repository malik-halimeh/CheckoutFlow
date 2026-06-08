/**
 * main.jsx
 *
 * Application entry point. This file bootstraps the React application
 * by mounting the root <App /> component into the DOM.
 *
 * React Concept – StrictMode:
 *   StrictMode is a development-only wrapper that highlights potential
 *   issues in an application. It activates additional checks and warnings
 *   for its descendants, such as detecting unexpected side effects and
 *   deprecated API usage. It does not affect the production build.
 *
 * Import order:
 *   1. React / ReactDOM – framework essentials
 *   2. Bootstrap CSS – grid, utilities, component styles
 *   3. Custom styles – Neo-Brutalist overrides (loaded AFTER Bootstrap
 *      so our custom properties and selectors take precedence)
 *   4. App component – the root of the component tree
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap 5 CSS – loaded via CDN in index.html, but we also import
// the npm package so Vite can tree-shake and bundle only what's needed.
// If using the CDN link in index.html, this import is a harmless no-op
// when the file doesn't exist locally. We keep it for completeness.
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom Neo-Brutalist checkout styles – must load AFTER Bootstrap
// to correctly override border-radius, shadows, and other properties.
import './styles/checkout.css';

import App from './App.jsx';

// Mount the React application into the #root DOM node.
// createRoot is the React 18+ concurrent mode API, replacing the legacy
// ReactDOM.render() call. It enables features like automatic batching
// and concurrent rendering when opted in.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
