import { Request, Response, Router } from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { registerValidator, loginValidator } from "../validators/auth";

const router = Router();

router.post("/register", registerValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email }});
  if(exists) return res.status(400).json({ message: "Email exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash }});
  return res.status(201).json({ id: user.id, email: user.email });
});

router.post("/login", loginValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }});
  if(!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email }});
});

export default router;
