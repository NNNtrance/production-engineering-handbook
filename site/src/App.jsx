import React, { useEffect, useState } from 'react';
import { REPO } from './config.js';

export default function App() {
  const [books, setBooks] = useState([]);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('hb-theme') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, [theme]);

  const toggleTheme = () => {
    const isDark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('hb-theme', next);
    } catch {}
  };

  useEffect(() => {
    fetch('/data/index.json')
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error('Failed to load index.json:', err));
  }, []);

  const totalCases = books.reduce((acc, b) => acc + (b.cases?.length || 0), 0);

  return (
    <>
      <button
        className="theme"
        type="button"
        aria-label="Toggle light and dark"
        onClick={toggleTheme}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" />
        </svg>
      </button>

      <main id="main">
        <header className="intro">
          <p className="kicker">
            <a href="https://onuracar.dev">onuracar.dev</a> / handbook
          </p>
          <h1>
            The <em>Handbook</em>
          </h1>
          <p className="lede">
            {totalCases || 67} problems I ran into while building my own projects and contributing
            to open source, filed into nine books. Pull one off the shelf.
          </p>
        </header>

        <div id="shelf" className="shelf">
          {/* Bookshelf component will be mounted here in Faz 2 */}
        </div>

        <p className="caption" id="caption" aria-live="polite">
          nine books, one per domain
        </p>

        <p className="foot">
          Every page is generated from the markdown in the{' '}
          <a href={REPO} target="_blank" rel="noopener">
            GitHub repo
          </a>
          , so nothing here is written twice.
        </p>
      </main>
    </>
  );
}
