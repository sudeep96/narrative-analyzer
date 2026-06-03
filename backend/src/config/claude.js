const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

const SINGLE_ANALYSIS_PROMPT = (text) => `You are a rhetorical analysis engine. Analyze the content below for 6 dimensions. Return ONLY valid JSON — no markdown, no explanation outside the JSON.

Content:
"""
${text}
"""

Return this exact JSON structure:
{
  "dimensions": [
    {
      "name": "Language Temperature",
      "level": "High|Medium|Low|None",
      "count": <number of emotionally charged words/phrases detected>,
      "summary": "<1-2 sentence objective description — no judgment words>",
      "evidence": [
        {"quote": "<exact substring from content>", "note": "<neutral technical note on why flagged>"}
      ]
    },
    {
      "name": "Claim vs Evidence",
      "level": "High|Medium|Low|None",
      "count": <total number of distinct claims made>,
      "summary": "<how many claims made vs how many had cited/linked evidence>",
      "evidence": [
        {"quote": "<unsupported claim exact text>", "note": "No source or evidence cited for this claim"}
      ]
    },
    {
      "name": "Logical Fallacies",
      "level": "High|Medium|Low|None",
      "count": <number detected>,
      "summary": "<types of logical patterns found, or None detected>",
      "evidence": [
        {"quote": "<exact text>", "note": "<fallacy name and one-sentence neutral description>"}
      ]
    },
    {
      "name": "Framing Direction",
      "level": "Problem-dominant|Neutral|Opportunity-dominant",
      "count": null,
      "summary": "<how facts and events are framed — problem vs opportunity vs neutral>",
      "evidence": [
        {"quote": "<example phrase>", "note": "<neutral framing note>"}
      ]
    },
    {
      "name": "Certainty Language",
      "level": "High|Medium|Low|None",
      "count": <number of instances where opinion is stated as obvious fact>,
      "summary": "<instances of words like clearly, obviously, everyone knows used to assert opinion as fact>",
      "evidence": [
        {"quote": "<exact phrase>", "note": "<neutral note>"}
      ]
    },
    {
      "name": "Counterargument Acknowledgement",
      "level": "High|Medium|Low|None",
      "count": <number of times opposing views or qualifications appear>,
      "summary": "<whether the content acknowledges complexity, opposing views, or qualifications>",
      "evidence": []
    }
  ]
}

Strict rules:
- Every quote must be an exact verbatim substring from the content
- All language must be clinically neutral — describe patterns, never judge intent
- Forbidden words in summaries/notes: misleading, wrong, biased, manipulative, dishonest, propaganda, good, bad
- Max 4 evidence items per dimension`;

const COMPARE_PROMPT = (sources) => `You are a rhetorical analysis engine. Analyze ${sources.length} pieces of content on the same topic. Return ONLY valid JSON.

${sources.map((t, i) => `SOURCE ${i + 1}:\n"""\n${t}\n"""`).join('\n\n')}

Return this exact JSON:
{
  "topic_detected": "<inferred shared topic in 5-8 words>",
  "sources": [
    ${sources.map((_, i) => `{
      "label": "Source ${i + 1}",
      "language_temperature": "<High|Medium|Low>",
      "unsupported_claims": <number>,
      "logical_fallacies": <number>,
      "framing": "<Problem-dominant|Neutral|Opportunity-dominant>",
      "certainty_language": <number>,
      "counterarguments": <number>,
      "key_difference": "<1 sentence — what makes this source rhetorically distinct. Neutral language only.>"
    }`).join(',')}
  ],
  "gap_summary": "<2-3 sentences describing the most notable differences. No judgment — only describe the gap.>"
}`;

const PUNCTUATION_PROMPT = (text) => `The following is a raw YouTube auto-generated transcript with no punctuation. Add appropriate punctuation and capitalize sentence starts. Do NOT change any words. Return ONLY the corrected text, nothing else.

"""
${text}
"""`;

async function callGemini(prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function parseJSON(raw) {
  // Strip markdown code fences if Gemini adds them
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function restorePunctuation(text) {
  const punctCount = (text.match(/[.!?,]/g) || []).length;
  const ratio = punctCount / text.length;
  if (ratio < 0.02) {
    const restored = await callGemini(PUNCTUATION_PROMPT(text));
    return restored.trim();
  }
  return text;
}

async function analyzeSingle(text) {
  const processedText = await restorePunctuation(text);
  const raw = await callGemini(SINGLE_ANALYSIS_PROMPT(processedText));
  return parseJSON(raw);
}

async function analyzeCompare(sources) {
  const processed = await Promise.all(sources.map(s => restorePunctuation(s)));
  const raw = await callGemini(COMPARE_PROMPT(processed));
  return parseJSON(raw);
}

module.exports = { analyzeSingle, analyzeCompare };
