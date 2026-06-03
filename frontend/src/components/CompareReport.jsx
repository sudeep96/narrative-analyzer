import React from 'react';

const DIMS = [
  { key: 'language_temperature', label: 'Language temperature' },
  { key: 'unsupported_claims', label: 'Unsupported claims' },
  { key: 'logical_fallacies', label: 'Logical fallacies' },
  { key: 'framing', label: 'Framing direction' },
  { key: 'certainty_language', label: 'Certainty language' },
  { key: 'counterarguments', label: 'Counterarguments' },
];

function cellColor(val) {
  if (val === 'High' || val === 'Problem-dominant' || (typeof val === 'number' && val >= 5)) return '#A32D2D';
  if (val === 'Medium' || (typeof val === 'number' && val >= 2)) return '#854F0B';
  return 'inherit';
}

export default function CompareReport({ data, onReset }) {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const sources = data.sources || [];
  return (
    <div className="compare-report">
      <div className="report">
        <div className="report-header">
          <div>
            <div className="report-title">Comparison Report</div>
            {data.topic_detected && <div className="report-meta">Topic: {data.topic_detected}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="report-date">{date}</span>
            <button className="new-btn" onClick={onReset}>New comparison</button>
          </div>
        </div>
        <div className="disclaimer">Textual patterns only. Not a judgment on the accuracy or credibility of any source.</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Dimension</th>
                {sources.map((s, i) => <th key={i}>{s.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {DIMS.map(dim => (
                <tr key={dim.key}>
                  <td className="dim-label">{dim.label}</td>
                  {sources.map((s, i) => {
                    const val = s[dim.key];
                    return <td key={i} style={{ color: cellColor(val), fontWeight: cellColor(val) !== 'inherit' ? 500 : 400 }}>{val == null ? '—' : String(val)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.gap_summary && (
          <div className="gap-summary">
            <div className="gap-label">Coverage gap</div>
            <p>{data.gap_summary}</p>
          </div>
        )}
      </div>
      {sources.map((s, i) => (
        <div key={i} className="source-card">
          <div className="source-card-header">{s.label} — key distinction</div>
          <p className="source-card-body">{s.key_difference || '—'}</p>
        </div>
      ))}
    </div>
  );
}