import React, { useState, useEffect } from 'react';
import { SPINE, HEIGHTS, ROMAN } from './config.js';

function ShelfDefs() {
  return (
    <defs>
      <linearGradient id="spineShade" x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".32" />
        <stop offset=".18" stopColor="#fff" stopOpacity=".10" />
        <stop offset=".42" stopColor="#fff" stopOpacity=".04" />
        <stop offset=".8" stopColor="#000" stopOpacity=".06" />
        <stop offset="1" stopColor="#000" stopOpacity=".36" />
      </linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#916140" />
        <stop offset="1" stopColor="#6b4429" />
      </linearGradient>
      <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b48a60" />
        <stop offset="1" stopColor="#9f7550" />
      </linearGradient>
      <linearGradient id="shelfShadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".28" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="pot" x1="0" x2="1">
        <stop offset="0" stopColor="#9c5233" />
        <stop offset=".45" stopColor="#c3714a" />
        <stop offset="1" stopColor="#93492c" />
      </linearGradient>
      <filter id="cloth" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.3 .22"
          numOctaves="2"
          seed="4"
          result="n"
        />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="t">
          <feFuncR type="linear" slope=".3" intercept=".78" />
          <feFuncG type="linear" slope=".3" intercept=".78" />
          <feFuncB type="linear" slope=".3" intercept=".78" />
          <feFuncA type="linear" slope="0" intercept="1" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="t" mode="multiply" result="m" />
        <feComposite in="m" in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="drop" x="-10%" y="-10%" width="125%" height="120%">
        <feDropShadow dx="6" dy="2" stdDeviation="4.5" floodColor="#000" floodOpacity=".26" />
      </filter>
    </defs>
  );
}

function Plank({ x1, x2, y, k }) {
  const bw = 24 * k;
  return (
    <>
      <rect x={x1} y={y + 16 * k} width={x2 - x1} height={30 * k} fill="url(#shelfShadow)" />
      <path
        d={`M${x1 + 46 * k} ${y + 16 * k} h${bw} q-4 ${30 * k} -${bw} ${40 * k} z`}
        fill="#5a3922"
      />
      <path
        d={`M${x2 - 46 * k} ${y + 16 * k} h-${bw} q4 ${30 * k} ${bw} ${40 * k} z`}
        fill="#5a3922"
      />
      <rect x={x1} y={y - 6 * k} width={x2 - x1} height={6 * k} fill="url(#woodTop)" />
      <rect x={x1} y={y} width={x2 - x1} height={16 * k} fill="url(#wood)" />
      <rect x={x1} y={y} width={x2 - x1} height="1" fill="#c79c70" opacity=".6" />
    </>
  );
}

function Bookend({ x, y, k }) {
  const h = 150 * k;
  return (
    <>
      <path d={`M${x} ${y - 3} v-${h} h${9 * k} v${h} z`} fill="#3a393e" />
      <path d={`M${x + 1.5} ${y - 3} v-${h - 2}`} stroke="#77767d" strokeWidth="1.2" />
      <rect x={x} y={y - 6 * k} width={44 * k} height={3 * k} fill="#3a393e" />
    </>
  );
}

function Plant({ x, y, k }) {
  const leaf = (tx, ty, r, s, c, key) => (
    <React.Fragment key={key}>
      <path
        transform={`translate(${tx} ${ty}) rotate(${r}) scale(${s})`}
        d="M0 0 C 9 -14 28 -17 40 -7 C 27 -2 12 2 0 0 Z"
        fill={c}
      />
      <path
        transform={`translate(${tx} ${ty}) rotate(${r}) scale(${s})`}
        d="M2 -1 C 14 -6 26 -8 38 -7"
        stroke="#2f4a28"
        strokeWidth=".8"
        fill="none"
        opacity=".5"
      />
    </React.Fragment>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path
        d="M2 -6 C 24 -2 30 30 26 70 C 25 84 30 96 36 104"
        stroke="#4d6b3c"
        strokeWidth="2"
        fill="none"
      />
      {leaf(26, 22, 70, 0.55, '#5d7d4b', 'l1')}
      {leaf(27, 52, 110, 0.5, '#4c6c3d', 'l2')}
      {leaf(30, 84, 75, 0.45, '#5d7d4b', 'l3')}
      <path d="M-30 -58 h62 l-8 55 h-46 z" fill="url(#pot)" />
      <rect x="-33" y="-66" width="68" height="10" rx="2" fill="#c97b54" />
      {leaf(0, -66, -150, 1, '#55764a', 'l4')}
      {leaf(-2, -66, -120, 1.1, '#4a6b3d', 'l5')}
      {leaf(0, -68, -88, 1.15, '#5f8150', 'l6')}
      {leaf(2, -66, -55, 1.05, '#4f7040', 'l7')}
      {leaf(4, -64, -25, 0.95, '#5d7d4b', 'l8')}
      {leaf(0, -66, -175, 0.8, '#4f7040', 'l9')}
    </g>
  );
}

function Spine({ i, book, x, base, w, h, lean, isPulled, onSelect, onHover, onFocus }) {
  const [label, cloth, ink] = SPINE[i] || ['Book', '#33506d', '#ecdcb8'];
  const n = book?.cases?.length || 0;
  const fs = Math.min(w * 0.3, 16, (h - 112) / (label.length * 0.56));
  const pivot = lean ? `rotate(${lean} ${x + w} ${base})` : undefined;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(i);
    }
  };

  return (
    <g transform={pivot}>
      <g
        className={`book${isPulled ? ' pulled' : ''}`}
        data-book={i}
        tabIndex={0}
        role="button"
        aria-label={`Book ${ROMAN[i]}: ${book?.name || ''}, ${n} problems`}
        onClick={() => onSelect(i)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => onHover(i)}
        onFocus={() => onFocus(i)}
      >
        <g transform={`translate(${x} ${base - h})`}>
          <rect
            className="bk-body"
            width={w}
            height={h}
            rx="2.5"
            fill={cloth}
            filter="url(#cloth)"
          />
          <rect width={w} height={h} rx="2.5" fill="url(#spineShade)" />
          <rect y="15" width={w} height="2.2" fill={ink} opacity=".7" />
          <rect y="21" width={w} height="1" fill={ink} opacity=".55" />
          <rect y={h - 22} width={w} height="1" fill={ink} opacity=".55" />
          <rect y={h - 17} width={w} height="2.2" fill={ink} opacity=".7" />
          <text
            className="sp-num"
            x={w / 2}
            y="44"
            textAnchor="middle"
            fontSize={Math.min(13, w * 0.3)}
            fill={ink}
          >
            {ROMAN[i]}
          </text>
          <text
            className="sp-title"
            transform={`translate(${w / 2} ${h / 2 + 4}) rotate(-90)`}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fs.toFixed(1)}
            fill={ink}
          >
            {label}
          </text>
          <text
            className="sp-count"
            x={w / 2}
            y={h - 32}
            textAnchor="middle"
            fontSize={Math.min(12, w * 0.26)}
            fill={ink}
            opacity=".85"
          >
            {n}
          </text>
        </g>
      </g>
    </g>
  );
}

export default function Shelf({ books, onOpenBook, curBook = -1, onHoverBook }) {
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setPhone(mq.matches);
    const handler = (e) => setPhone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!books || books.length === 0) return null;

  const rows = phone ? [[0, 1, 2, 3, 4], [5, 6, 7, 8]] : [[0, 1, 2, 3, 4, 5, 6, 7, 8]];
  const W = phone ? 440 : 1000;
  const RH = phone ? 260 : 390;
  const k = phone ? 0.72 : 1;
  const H = rows.length * RH + (phone ? 60 : 70);

  return (
    <div id="shelf" className="shelf">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="Bookshelf with nine books"
      >
        <ShelfDefs />
        {rows.map((row, r) => {
          const base = (r + 1) * RH;
          const widths = row.map((i) =>
            Math.round((phone ? 30 : 40) + (books[i]?.cases?.length || 0) * (phone ? 3.6 : 5.4))
          );
          const gap = phone ? 3 : 4;
          const first = r === 0;
          const last = r === rows.length - 1;
          const lastH = (HEIGHTS[row[row.length - 1]] || 260) * k;
          const leanX = last ? lastH * Math.sin((7 * Math.PI) / 180) : 0;
          const endW = first ? 12 * k : 0;
          const plantW = last ? 92 * k : 0;
          const total =
            endW + widths.reduce((a, b) => a + b, 0) + gap * (row.length - 1) + leanX + plantW;
          let currentX = (W - total) / 2;

          const plankX1 = Math.max(10, currentX - 46 * k);
          const plankX2 = Math.min(W - 10, currentX + total + 40 * k);

          const bookendX = currentX;
          if (first) {
            currentX += endW;
          }

          const bookPositions = row.map((bi, j) => {
            const pos = { bi, x: currentX, w: widths[j] };
            currentX += widths[j] + gap;
            return pos;
          });

          const plantX = currentX + leanX + 36 * k;

          return (
            <React.Fragment key={`row-${r}`}>
              <Plank x1={plankX1} x2={plankX2} y={base} k={k} />
              {first && <Bookend x={bookendX} y={base} k={k} />}
              <g filter="url(#drop)">
                {bookPositions.map(({ bi, x, w }, j) => {
                  const lean = last && j === row.length - 1 ? 7 : 0;
                  const h = Math.round((HEIGHTS[bi] || 260) * k);
                  return (
                    <Spine
                      key={`book-${bi}`}
                      i={bi}
                      book={books[bi]}
                      x={x}
                      base={base - 2}
                      w={w}
                      h={h}
                      lean={lean}
                      isPulled={curBook === bi}
                      onSelect={onOpenBook}
                      onHover={onHoverBook}
                      onFocus={onHoverBook}
                    />
                  );
                })}
              </g>
              {last && <Plant x={plantX} y={base} k={k} />}
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}
