// ⚠️ SECURITY ISSUE: Utility functions with security vulnerabilities

const crypto = require('crypto');
const bcrypt = require('bcrypt');

// ⚠️ SECURITY ISSUE: Hardcoded credentials
const DEFAULT_PASSWORD = "password123";
const ADMIN_API_KEY = "admin-secret-key-do-not-share";

// ⚠️ SECURITY ISSUE: Weak encryption algorithm
function weakEncrypt(data) {
  const algorithm = 'des'; // DES is deprecated and insecure
  const key = 'mykey123'; // Hardcoded key
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// ⚠️ SECURITY ISSUE: SQL injection vulnerability
function buildUserQuery(username, password) {
  // Direct string concatenation creates SQL injection risk
  return `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
}

// ⚠️ SECURITY ISSUE: Command injection vulnerability
function executeSystemCommand(userInput) {
  const { exec } = require('child_process');
  // Directly executing user input without sanitization
  exec(`ls -la ${userInput}`, (error, stdout, stderr) => {
    console.log(stdout);
  });
}

// ⚠️ SECURITY ISSUE: Weak random number generation
function generateToken() {
  // Math.random() is not cryptographically secure
  return Math.random().toString(36).substring(2, 15);
}

// ⚠️ SECURITY ISSUE: Password validation is too weak
function isPasswordValid(password) {
  // Only checks length, no complexity requirements
  return password.length >= 6;
}

// ⚠️ SECURITY ISSUE: Logging sensitive data
function loginUser(username, password) {
  console.log(`User login attempt: ${username} with password: ${password}`);
  // More insecure code here
  return true;
}

// Code smell: Unused variable
function processData(data) {
  var unusedVariable = "This is never used";
  const result = data.map(item => item.value);
  return result;
}

// Code smell: Commented out code
function calculate(a, b) {
  // return a + b;
  // return a - b;
  return a * b;
}

// ⚠️ SECURITY ISSUE: XSS vulnerability
function renderUserContent(content) {
  // Directly rendering user content without sanitization
  return `<div>${content}</div>`;
}

module.exports = {
  weakEncrypt,
  buildUserQuery,
  executeSystemCommand,
  generateToken,
  isPasswordValid,
  loginUser,
  processData,
  calculate,
  renderUserContent,
  DEFAULT_PASSWORD,
  ADMIN_API_KEY
};

