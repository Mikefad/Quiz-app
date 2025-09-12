import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { body, validationResult } from "express-validator";

const router = Router();

router.get("/start", async (_, res) => {
  const questions = await prisma.question.findMany({
    include: { options: true },
  });
  res.json(questions);
});

router.post(
  "/submit",
  [
    body("answers").isArray({ min: 1 }).withMessage("answers[] required"),
    body("answers.*.questionId").isInt().withMessage("questionId must be int"),
    body("answers.*.optionId").isInt().withMessage("optionId must be int"),
    body("elapsedMs").isInt({ min: 0 }).withMessage("elapsedMs must be >= 0"),
  ],
  async (req: Request, res: Response) => {
    // quick debug to your server console:
    console.log("SUBMIT BODY:", JSON.stringify(req.body));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    type Answer = { questionId: number; optionId: number };
    const { answers, elapsedMs } = req.body as {
      answers: Answer[];
      elapsedMs: number;
    };

    const ids = answers.map((a) => a.optionId);
    const options = await prisma.option.findMany({
      where: { id: { in: ids } },
      select: { id: true, isCorrect: true, questionId: true },
    });

    let correct = 0;
    for (const a of answers) {
      const opt = options.find(
        (o: { id: number; isCorrect: boolean }) => o.id === a.optionId
      );
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
