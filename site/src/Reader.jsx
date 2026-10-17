import React from 'react';

export default function Reader({ book }) {
  const { readerRef, wrapRef, spreadRef, pageLRef, pageRRef } = book;

  return (
    <div
      className="reader"
      id="reader"
      ref={readerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Book"
      hidden
    >
      <div className="bar">
        <button type="button" data-act="shelf">
          &larr; Shelf
        </button>
        <div className="bar-title">
          <span className="rn"></span>
          <span className="nm"></span>
        </div>
        <div className="bar-nav">
          <button type="button" data-act="toc">
            <span className="lbl">Contents</span>
            <span aria-hidden="true" className="ico">
              {' '}
              &#9776;
            </span>
          </button>
          <button
            type="button"
            className="arrow"
            data-act="prev"
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          <span className="pos"></span>
          <button
            type="button"
            className="arrow"
            data-act="next"
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <a className="gh" target="_blank" rel="noopener">
            GitHub ↗
          </a>
        </div>
      </div>
      <div className="stage" id="stage">
        <div className="book-wrap" id="bookWrap" ref={wrapRef}>
          <div className="spread" id="spread" ref={spreadRef}>
            <div className="page left" id="pageL" ref={pageLRef}></div>
            <div className="page right" id="pageR" ref={pageRRef}></div>
            <button
              type="button"
              className="turn prev"
              data-act="prev"
              aria-label="Previous page"
            ></button>
            <button
              type="button"
              className="turn next"
              data-act="next"
              aria-label="Next page"
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
}
