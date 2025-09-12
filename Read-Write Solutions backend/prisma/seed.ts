// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const QUESTIONS = [
  {
    text: "Which HTTP status means 'Unauthorized'?",
    options: [
      { text: "200", isCorrect: false },
      { text: "301", isCorrect: false },
      { text: "401", isCorrect: true },
      { text: "500", isCorrect: false },
    ],
  },
  {
    text: "Which method is idempotent by definition?",
    options: [
      { text: "POST", isCorrect: false },
      { text: "PUT", isCorrect: true },
      { text: "PATCH", isCorrect: false },
      { text: "CONNECT", isCorrect: false },
    ],
  },
  {
    text: "What does REST stand for?",
    options: [
      { text: "Representational State Transfer", isCorrect: true },
      { text: "Remote Execution and State Transfer", isCorrect: false },
      { text: "Resource Exchange over Secure Transport", isCorrect: false },
      { text: "Remote State Transition", isCorrect: false },
    ],
  },
  {
    text: "Which SQL clause filters rows after aggregation?",
    options: [
      { text: "WHERE", isCorrect: false },
      { text: "HAVING", isCorrect: true },
      { text: "GROUP BY", isCorrect: false },
      { text: "ORDER BY", isCorrect: false },
    ],
  },
  {
    text: "Which hashing lib is commonly used for passwords in Node?",
    options: [
      { text: "crypto.randomUUID", isCorrect: false },
      { text: "bcrypt", isCorrect: true },
      { text: "argon-random", isCorrect: false },
      { text: "sha1", isCorrect: false },
    ],
  },
  {
    text: "JWTs are typically sent in which header?",
    options: [
      { text: "X-API-KEY", isCorrect: false },
      { text: "Authorization: Bearer <token>", isCorrect: true },
      { text: "Cookie: jwt=<token>", isCorrect: false },
      { text: "Auth-Token", isCorrect: false },
    ],
  },
  {
    text: "Which SQL statement creates a table?",
    options: [
      { text: "INSERT TABLE", isCorrect: false },
      { text: "CREATE TABLE", isCorrect: true },
      { text: "MAKE TABLE", isCorrect: false },
      { text: "NEW TABLE", isCorrect: false },
    ],
  },
  {
    text: "Which is a *client-side* routing library for React?",
    options: [
      { text: "Express Router", isCorrect: false },
      { text: "React Router", isCorrect: true },
      { text: "Zustand Router", isCorrect: false },
      { text: "Axios Router", isCorrect: false },
    ],
  },
  {
    text: "What does CORS primarily control?",
    options: [
      { text: "Password complexity rules", isCorrect: false },
      { text: "Cross-origin HTTP request permissions", isCorrect: true },
      { text: "Database connection pooling", isCorrect: false },
      { text: "Server CPU throttling", isCorrect: false },
    ],
  },
  {
    text: "Which SQL command updates existing rows?",
    options: [
      { text: "UPDATE", isCorrect: true },
      { text: "ALTER", isCorrect: false },
      { text: "REPLACE", isCorrect: false },
      { text: "CHANGE", isCorrect: false },
    ],
  },
];

async function main() {
  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: {
        text: q.text,
        options: { create: q.options },
      },
    });
  }
  console.log(`Seeded ${QUESTIONS.length} questions.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
