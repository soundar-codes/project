const mongoose = require('mongoose');

const s = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['active','archived','paused'], default: 'active' },
  tags:        [String],
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

s.pre('save', function(next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Project', s);
