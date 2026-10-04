/**
 * Validation utilities for user authentication
 */

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  return { valid: true };
}

export function validateEmail(email) {
  // Line 18: BUG - Direct call to .trim() without guarding against null or undefined
  // Guard against null, undefined, or non-string inputs
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Invalid email address format' };
  }

  return { valid: true };
}

export function validateLoginForm(formData) {
  if (!formData) {
    return { valid: false, error: 'Form data is missing' };
  }

  const emailResult = validateEmail(formData.email);
  if (!emailResult.valid) {
    return emailResult;
  }

  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.valid) {
    return passwordResult;
  }

  return { valid: true };
}
