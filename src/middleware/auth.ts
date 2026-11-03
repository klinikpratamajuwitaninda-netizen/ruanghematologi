import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    role: 'lecturer' | 'student';
    npm?: string;
  };
}

export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Support lecturer session token or Firebase ID token
  if (token.startsWith('lecturer_session_')) {
    req.user = {
      uid: token,
      email: 'juwita.ninda@ikesrajawali.ac.id',
      name: 'dr. Juwita Ninda Suherman, M.Kes',
      role: 'lecturer',
    };
    return next();
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || 'dr. Juwita Ninda Suherman, M.Kes',
      role: 'lecturer',
    };
    return next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
}
