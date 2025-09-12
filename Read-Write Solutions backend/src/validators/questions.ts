import { body } from "express-validator";
export const questionCreateValidator = [
  body("text").isString().isLength({ min: 3 }),
  body("options").isArray({ min: 4, max: 4 }),
  body("options.*.text").isString().notEmpty(),
  body("options.*.isCorrect").isBoolean(),
  body("options").custom((opts: any[]) => opts.filter(o => o.isCorrect).length === 1)
];
