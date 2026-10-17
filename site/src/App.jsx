import React, { useEffect, useState } from 'react';
import Shelf from './Shelf.jsx';
import Reader from './Reader.jsx';
import { useBook } from './useBook.js';
import { REPO, ROMAN } from './config.js';

export default function App() {
  const [books, setBooks] = useState([]);
  const [caption, setCaption] = useState('nine books, one per domain');
  const [curBook, setCurBook] = useState(-1);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('hb-theme') || '';
    } catch {
      return '';
    }
  });

  const book = useBook({ books, setCurBook });

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
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    fetch(`${base}/data/index.json`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error('Failed to load index.json:', err));
  }, []);

  const handleHoverBook = (i) => {
    if (books[i]) {
      setCaption(`${ROMAN[i]} · ${books[i].name}, ${books[i].cases.length} problems`);
      book.prefetchBook(i);
    }
  };

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

        <Shelf
          books={books}
          curBook={curBook}
          onOpenBook={book.openBook}
          onHoverBook={handleHoverBook}
        />

        <p className="caption" id="caption" aria-live="polite">
          {caption}
        </p>

        <p className="foot">
          Every page is generated from the markdown in the{' '}
          <a href={REPO} target="_blank" rel="noopener">
            GitHub repo
          </a>
          , so nothing here is written twice.
        </p>
      </main>

      <Reader book={book} />
    </>
  );
}
