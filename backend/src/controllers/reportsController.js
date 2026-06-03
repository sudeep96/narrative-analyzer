const Report = require('../models/Report');

async function list(req, res, next) {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    const query = {};
    if (type) query.type = type;
    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(Math.min(parseInt(limit), 50)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Report.countDocuments(query);
    res.json({ reports, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) { next(err); }
}

module.exports = { list, getOne };