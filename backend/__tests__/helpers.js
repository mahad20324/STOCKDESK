const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function adminToken(overrides = {}) {
  return signToken({ id: 1, role: 'Admin', shopId: 10, ...overrides });
}

function staffToken(overrides = {}) {
  return signToken({ id: 2, role: 'Staff', shopId: 10, ...overrides });
}

function superAdminToken(overrides = {}) {
  return signToken({ id: 99, role: 'SuperAdmin', shopId: null, ...overrides });
}

function unverifiedToken(overrides = {}) {
  return signToken({ id: 3, role: 'Admin', shopId: 11, ...overrides });
}

module.exports = { JWT_SECRET, signToken, adminToken, staffToken, superAdminToken, unverifiedToken };
