const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const s = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  avatar:    { type: String, default: '' },
  role:      { type: String, enum: ['admin','developer','viewer'], default: 'developer' },
  createdAt: { type: Date, default: Date.now }
});

s.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

s.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', s);
