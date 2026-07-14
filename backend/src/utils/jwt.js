import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const EXPIRES_IN = '7d'

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}
