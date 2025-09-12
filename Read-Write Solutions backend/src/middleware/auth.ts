import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request { userId?: number; }

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction){
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if(!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
