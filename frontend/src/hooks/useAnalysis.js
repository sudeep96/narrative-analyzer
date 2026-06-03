import { useState } from 'react';
import { analyzeSingle, analyzeCompare } from '../utils/api';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function runSingle({ text, url }) {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await analyzeSingle({ text, url });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  }

  async function runCompare(sources) {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await analyzeCompare(sources);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. Please try again.');
    } finally { setLoading(false); }
  }

  function reset() { setResult(null); setError(null); }

  return { loading, error, result, runSingle, runCompare, reset };
}