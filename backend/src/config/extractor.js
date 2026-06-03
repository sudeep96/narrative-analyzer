const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const cheerio = require('cheerio');

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

async function extractFromYouTube(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error('Could not extract YouTube video ID from URL');
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  if (!transcript || transcript.length === 0) {
    throw new Error('No transcript available for this video.');
  }
  const text = transcript.map(item => item.text).join(' ');
  return { text, source: 'youtube', videoId };
}

async function extractFromArticle(url) {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NarrativeAnalyzer/1.0)' },
    maxContentLength: 500000,
  });
  const $ = cheerio.load(response.data);
  $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();
  const selectors = ['article','[role="main"]','.article-body','.post-content','.entry-content','main'];
  let text = '';
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 200) {
      text = el.text().trim();
      break;
    }
  }
  if (!text) text = $('body').text().trim();
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length < 100) throw new Error('Could not extract article text. Page may be paywalled.');
  return { text, source: 'article' };
}

async function extractFromUrl(url) {
  if (isYouTubeUrl(url)) return extractFromYouTube(url);
  return extractFromArticle(url);
}

module.exports = { extractFromUrl, isYouTubeUrl };