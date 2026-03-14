const crypto = require('crypto');

const db = {
  users: [],
  projects: [],
  apps: [],
  builds: [],
  uuid: () => crypto.randomBytes(12).toString('hex')
};

module.exports = db;
