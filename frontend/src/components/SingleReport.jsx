import React, { useState } from 'react';
import RadarChart from './RadarChart';

function levelClass(level = '') {
  const l = level.toLowerCase();
  if (l === 'high' || l === 'problem-dominant') return 'badge badge-high';
  if (l === 'medium' || l === 'moderate') return 'badge badge-medium';
  if (l === 'low') return 'badge badge-low';
  return 'badge badge-none';
}

function Dimension({ dim }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dimension">
      <button className="dim-header" onClick={() => setOpen(o => !o)}>
        <span className="dim-name">{dim.name}</span>
        {dim.count != null && <span className="dim-count">{dim.count} instance{dim.count !== 1 ? 's' : ''}</span>}
        <span className={levelClass(dim.level)}>{dim.level || '—'}</span>
        <span className={`chevron ${open ? 'open' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="dim-body">
          <p className="dim-summary">{dim.summary}</p>
          {dim.evidence?.length > 0 && (
            <div className="evidence-list">
              {dim.evidence.map((e, i) => (
                <div key={i} className="evidence-item">
                  <p className="evidence-quote">"{e.quote || e}"</p>
                  {e.note && <p className="evidence-note">{e.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SingleReport({ data, onReset }) {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="report">
      <div className="report-header">
        <div>
          <div className="report-title">Content Analysis Report</div>
          {data.wordCount && <div className="report-meta">{data.wordCount} words analyzed</div>}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="report-date">{date}</span>
          <button className="new-btn" onClick={onReset}>New analysis</button>
        </div>
      </div>
      <div className="disclaimer">This report reflects textual patterns only. It does not constitute a judgment on the creator's intent, credibility, or accuracy. Every finding is backed by exact text from the content.</div>
      <div className="radar-wrap"><RadarChart dimensions={data.dimensions || []} /></div>
      {(data.dimensions || []).map((dim, i) => <Dimension key={i} dim={dim} />)}
    </div>
  );
}