import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { body, validationResult } from "express-validator";

const router = Router();

router.get("/start", async (_: Request, res: Response) => {
  const questions = await prisma.question.findMany({
    include: { options: true },
    orderBy: { id: "asc" },
  });
  res.json(questions);
});

router.post(
  "/submit",
  [
    body("answers").isArray().withMessage("answers must be an array"),
    // Allow empty answers array (e.g., auto-submit with nothing selected)
    body("answers.*.questionId").optional().toInt().isInt().withMessage("questionId must be int"),
    body("answers.*.optionId").optional().toInt().isInt().withMessage("optionId must be int"),
    body("elapsedMs").toInt().isInt({ min: 0 }).withMessage("elapsedMs must be >= 0"),
  ],
  async (req: Request, res: Response) => {
    // Debug if needed:
    // console.log("SUBMIT BODY RAW:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    type Answer = { questionId: number; optionId: number };
    const { answers = [], elapsedMs } = req.body as {
      answers: Answer[];
      elapsedMs: number;
    };

    if (!answers.length) {
      return res.json({ total: 0, correct: 0, score: 0, timeTakenMs: elapsedMs });
    }

    const optionIds = answers.map((a) => a.optionId);
    const options = await prisma.option.findMany({
      where: { id: { in: optionIds } },
      select: { id: true, isCorrect: true, questionId: true },
    });

    let correct = 0;
    for (const a of answers) {
      const opt = options.find((o) => o.id === a.optionId);
      if (opt?.isCorrect) correct++;
    }

    res.json({
      total: answers.length,
      correct,
      score: Math.round((correct / Math.max(answers.length, 1)) * 100),
      timeTakenMs: elapsedMs,
    });
  }
);

export default router;
