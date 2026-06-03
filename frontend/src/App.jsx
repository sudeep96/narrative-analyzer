import React, { useState } from 'react';
import { useAnalysis } from './hooks/useAnalysis';
import SingleReport from './components/SingleReport';
import CompareReport from './components/CompareReport';
import './App.css';

function SingleInput({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'url'

  function handleSubmit() {
    if (inputMode === 'url') onSubmit({ url });
    else onSubmit({ text });
  }

  const isValid = inputMode === 'url' ? url.trim().length > 10 : text.trim().length >= 100;

  return (
    <div className="input-section">
      <div className="input-mode-tabs">
        <button className={inputMode === 'text' ? 'mode-tab active' : 'mode-tab'} onClick={() => setInputMode('text')}>Paste text</button>
        <button className={inputMode === 'url' ? 'mode-tab active' : 'mode-tab'} onClick={() => setInputMode('url')}>URL</button>
      </div>

      {inputMode === 'text' ? (
        <>
          <div className="input-label">Paste article text or YouTube transcript</div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the full text here. For YouTube: open transcript from the video menu, select all, paste here."
            rows={8}
          />
          <div className="char-count">{text.length} characters {text.length < 100 && text.length > 0 && '(need 100+)'}</div>
        </>
      ) : (
        <>
          <div className="input-label">YouTube video URL or article URL</div>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://example.com/article"
            className="url-input"
          />
          <div className="input-hint">YouTube: transcript must be available on the video. Articles: works on most non-paywalled pages.</div>
        </>
      )}

      <button className="analyze-btn" onClick={handleSubmit} disabled={!isValid || loading}>
        {loading ? 'Analyzing...' : 'Analyze content'}
      </button>
    </div>
  );
}

function CompareInput({ onSubmit, loading }) {
  const [slots, setSlots] = useState([{ text: '', label: 'Source 1' }, { text: '', label: 'Source 2' }]);

  function updateSlot(i, val) {
    setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, text: val } : slot));
  }

  function addSlot() {
    if (slots.length >= 5) return;
    setSlots(s => [...s, { text: '', label: `Source ${s.length + 1}` }]);
  }

  function removeSlot(i) {
    if (slots.length <= 2) return;
    setSlots(s => s.filter((_, idx) => idx !== i).map((slot, idx) => ({ ...slot, label: `Source ${idx + 1}` })));
  }

  const validSlots = slots.filter(s => s.text.trim().length >= 100);
  const canSubmit = validSlots.length >= 2;

  return (
    <div className="input-section">
      <div className="input-label">Paste content from multiple sources on the same topic</div>

      {slots.map((slot, i) => (
        <div key={i} className="compare-slot">
          <div className="slot-header">
            <span className="slot-label">{slot.label}</span>
            {slots.length > 2 && (
              <button className="remove-slot" onClick={() => removeSlot(i)}>Remove</button>
            )}
          </div>
          <textarea
            value={slot.text}
            onChange={e => updateSlot(i, e.target.value)}
            placeholder={`Paste ${slot.label.toLowerCase()} text here... (min 100 characters)`}
            rows={5}
          />
        </div>
      ))}

      {slots.length < 5 && (
        <button className="add-slot-btn" onClick={addSlot}>+ Add another source</button>
      )}

      <button className="analyze-btn" onClick={() => onSubmit(slots)} disabled={!canSubmit || loading}>
        {loading ? `Analyzing ${validSlots.length} sources...` : `Compare ${validSlots.length} sources`}
      </button>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('single');
  const { loading, error, result, runSingle, runCompare, reset } = useAnalysis();

  return (
    <div className="app">
      <div className="header">
        <h1>Narrative Analyzer</h1>
        <p>
          Decode the rhetorical construction of any article or video.
          No verdicts — only patterns, with exact evidence.
        </p>
      </div>

      {!result && (
        <div className="tabs">
          <button className={tab === 'single' ? 'tab active' : 'tab'} onClick={() => { setTab('single'); reset(); }}>
            Single content
          </button>
          <button className={tab === 'compare' ? 'tab active' : 'tab'} onClick={() => { setTab('compare'); reset(); }}>
            Compare sources
          </button>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner" />
          {tab === 'single' ? 'Analyzing rhetorical patterns...' : 'Analyzing all sources...'}
        </div>
      )}

      {!loading && !result && tab === 'single' && (
        <SingleInput onSubmit={runSingle} loading={loading} />
      )}

      {!loading && !result && tab === 'compare' && (
        <CompareInput onSubmit={runCompare} loading={loading} />
      )}

      {result && tab === 'single' && (
        <SingleReport data={result} onReset={reset} />
      )}

      {result && tab === 'compare' && (
        <CompareReport data={result} onReset={reset} />
      )}
    </div>
  );
}
