import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { questionCreateValidator } from "../validators/questions";
import { validationResult } from "express-validator";

const router = Router();

router.get("/", requireAuth, async (_, res) => {
  const questions = await prisma.question.findMany({ include: { options: true }});
  res.json(questions);
});

router.post("/", requireAuth, questionCreateValidator, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text, options } = req.body;
  const q = await prisma.question.create({ data: {
    text,
    options: { create: options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })) }
  }, include: { options: true }});
  res.status(201).json(q);
});

router.put("/:id", requireAuth, questionCreateValidator, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { text, options } = req.body;
  await prisma.option.deleteMany({ where: { questionId: id }});
  const q = await prisma.question.update({
    where: { id },
    data: {
      text,
      options: { create: options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })) }
    },
    include: { options: true }
  });
  res.json(q);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.option.deleteMany({ where: { questionId: id }});
  await prisma.question.delete({ where: { id }});
  res.status(204).end();
});

export default router;
