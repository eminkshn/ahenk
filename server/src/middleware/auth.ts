import { Request, Response, NextFunction } from 'express'
import { verifyAccess } from '../lib/jwt'

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Oturum açmanız gerekiyor' })
    return
  }
  try {
    const payload = verifyAccess(header.slice(7))
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Token geçersiz veya süresi dolmuş' })
  }
}
