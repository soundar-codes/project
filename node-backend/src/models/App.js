const mongoose = require('mongoose');

const s = new mongoose.Schema({
  name:      { type: String, required: true },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform:  { type: String, enum: ['web','android','ios','cross-platform'], default: 'web' },
  framework: { type: String, default: 'react' },
  status:    { type: String, enum: ['draft','building','live','failed'], default: 'draft' },
  buildUrl:  { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('App', s);
