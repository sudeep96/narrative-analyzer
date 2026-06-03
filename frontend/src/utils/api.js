import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 60000 });

export async function analyzeSingle({ text, url }) {
  const { data } = await api.post('/analyze/single', { text, url });
  return data;
}

export async function analyzeCompare(sources) {
  const { data } = await api.post('/analyze/compare', { sources });
  return data;
}

export default api;