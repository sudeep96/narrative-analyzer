const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  quote: String,
  note: String,
}, { _id: false });

const dimensionSchema = new mongoose.Schema({
  name: String,
  level: String,
  count: mongoose.Schema.Types.Mixed,
  summary: String,
  evidence: [evidenceSchema],
}, { _id: false });

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ['single', 'compare'], required: true },
  sourceUrl: String,
  sourceType: { type: String, enum: ['youtube', 'article', 'pasted'] },
  dimensions: [dimensionSchema],
  topicDetected: String,
  sources: [mongoose.Schema.Types.Mixed],
  gapSummary: String,
  sourceCount: Number,
  wordCount: Number,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

reportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('Report', reportSchema);