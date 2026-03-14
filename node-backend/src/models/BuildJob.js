const mongoose = require('mongoose');

const s = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  appName:     { type: String, default: 'MyApp' },
  code:        { type: String, required: true },
  framework:   { type: String, default: 'react' },
  platforms:   [{ type: String, enum: ['web','android','ios'] }],
  status:      { type: String, enum: ['queued','building','success','failed'], default: 'queued' },
  outputs: {
    web:     { type: String, default: '' },
    android: { type: String, default: '' },
    ios:     { type: String, default: '' }
  },
  logs:        [{ type: String }],
  createdAt:   { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('BuildJob', s);
