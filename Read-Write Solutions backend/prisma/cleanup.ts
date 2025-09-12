import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Delete children first because of FK
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  console.log("Cleared questions & options");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
