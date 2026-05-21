import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'auraquest_secret_key_123';

/**
 * Signs a JWT token for a given user.
 * @param {object} payload The user payload to sign { id, username }
 * @returns {string} The signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Extracts and verifies JWT from the request Authorization headers.
 * Throws an error if unauthorized.
 * @param {Request} request The Next.js API Request object
 * @returns {object} The decoded token payload { id, username }
 */
export function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Unauthorized');
  }
}
