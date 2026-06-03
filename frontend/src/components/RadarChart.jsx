import React from 'react';

const DIMS = ['Language Temperature','Claim vs Evidence','Logical Fallacies','Framing Direction','Certainty Language','Counterargument Acknowledgement'];
const SHORT = ['Language','Claims','Logic','Framing','Certainty','Counter-args'];

function levelToScore(level = '') {
  const l = level.toLowerCase();
  if (l === 'high' || l === 'problem-dominant') return 1;
  if (l === 'medium' || l === 'moderate') return 0.6;
  if (l === 'low') return 0.3;
  return 0;
}

export default function RadarChart({ dimensions = [] }) {
  const cx = 160, cy = 160, r = 110, n = 6;
  const angles = DIMS.map((_, i) => (Math.PI * 2 * i / n) - Math.PI / 2);

  function pt(radius, i) { return [cx + radius * Math.cos(angles[i]), cy + radius * Math.sin(angles[i])]; }
  function poly(frac) { return DIMS.map((_, i) => pt(r * frac, i).join(',')).join(' '); }

  const scores = DIMS.map(d => {
    const found = dimensions.find(x => x.name?.toLowerCase().includes(d.toLowerCase().split(' ')[0]));
    return found ? levelToScore(found.level) : 0;
  });

  return (
    <svg viewBox="0 0 320 320" width="240" height="240" style={{ display: 'block', margin: '0 auto' }}>
      {[1, 0.66, 0.33].map(frac => <polygon key={frac} points={poly(frac)} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />)}
      {DIMS.map((_, i) => { const [x,y] = pt(r,i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />; })}
      <polygon points={scores.map((s,i) => pt(r*s,i).join(',')).join(' ')} fill="rgba(30,80,200,0.12)" stroke="#1a4db3" strokeWidth="1.5" />
      {scores.map((s,i) => { const [x,y] = pt(r*s,i); return <circle key={i} cx={x} cy={y} r="3.5" fill="#1a4db3" />; })}
      {DIMS.map((_, i) => { const [x,y] = pt(r+22,i); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="rgba(0,0,0,0.45)" fontFamily="sans-serif">{SHORT[i]}</text>; })}
    </svg>
  );
}