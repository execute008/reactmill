import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importieren Sie die Tailwind CSS Datei
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

export { default as Game } from './components/Game';
export { default as Player } from './components/Player';
export { default as Enemy } from './components/Enemy';