const { analyzeSingle, analyzeCompare } = require('../config/claude');
const { extractFromUrl } = require('../config/extractor');
const Report = require('../models/Report');

const MAX_TEXT_LENGTH = 8000;

function wordCount(text) { return text.trim().split(/\s+/).length; }

function validateText(text) {
  if (!text || typeof text !== 'string') return 'Text is required';
  if (text.trim().length < 100) return 'Content too short. Need at least 100 characters.';
  return null;
}

async function single(req, res, next) {
  try {
    let { text, url } = req.body;
    let sourceType = 'pasted', sourceUrl = null;

    if (url && !text) {
      try {
        const extracted = await extractFromUrl(url);
        text = extracted.text;
        sourceType = extracted.source;
        sourceUrl = url;
      } catch (err) {
        return res.status(422).json({ error: err.message });
      }
    }

    const validationError = validateText(text);
    if (validationError) return res.status(400).json({ error: validationError });

    const trimmedText = text.slice(0, MAX_TEXT_LENGTH);
    const result = await analyzeSingle(trimmedText);

    try {
      await Report.create({ type: 'single', sourceUrl, sourceType, dimensions: result.dimensions, wordCount: wordCount(trimmedText) });
    } catch (dbErr) {
      console.warn('DB save failed (non-fatal):', dbErr.message);
    }

    return res.json({ success: true, wordCount: wordCount(trimmedText), sourceType, ...result });
  } catch (err) {
    if (err.message?.includes('JSON')) return res.status(502).json({ error: 'Analysis parsing failed. Try again.' });
    next(err);
  }
}

async function compare(req, res, next) {
  try {
    let { sources } = req.body;
    if (!Array.isArray(sources) || sources.length < 2) return res.status(400).json({ error: 'Provide at least 2 sources.' });
    if (sources.length > 5) return res.status(400).json({ error: 'Maximum 5 sources.' });

    const resolvedSources = await Promise.all(sources.map(async (s, i) => {
      if (s.url && !s.text) {
        try {
          const extracted = await extractFromUrl(s.url);
          return { ...s, text: extracted.text, sourceType: extracted.source };
        } catch (err) { throw new Error(`Source ${i + 1}: ${err.message}`); }
      }
      return { ...s, sourceType: 'pasted' };
    }));

    for (let i = 0; i < resolvedSources.length; i++) {
      const err = validateText(resolvedSources[i].text);
      if (err) return res.status(400).json({ error: `Source ${i + 1}: ${err}` });
    }

    const texts = resolvedSources.map(s => s.text.slice(0, MAX_TEXT_LENGTH));
    const result = await analyzeCompare(texts);

    try {
      await Report.create({ type: 'compare', topicDetected: result.topic_detected, sources: result.sources, gapSummary: result.gap_summary, sourceCount: sources.length });
    } catch (dbErr) {
      console.warn('DB save failed (non-fatal):', dbErr.message);
    }

    return res.json({ success: true, ...result });
  } catch (err) {
    if (err.message?.includes('JSON')) return res.status(502).json({ error: 'Analysis parsing failed. Try again.' });
    next(err);
  }
}

module.exports = { single, compare };