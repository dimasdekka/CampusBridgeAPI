import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();
const SALT = '$2b$10$.MftzcPPsR5TUTYRYWGyQu'; // Sesuaikan dengan SALT di .env

async function main() {
  await prisma.user.deleteMany({});

  await prisma.user.createMany({
    data: [
      {
        id: '221091750079',
        email: 'dhimasdekananta@unpam.com',
        hashed_password: hashSync('password123', SALT),
        role: 'student',
        name: 'Dhimas Dekananta',
        department: 'System Informatics',
      },
      {
        id: '0000001',
        email: 'rimasyaayujaeningsih@unpam.com',
        hashed_password: hashSync('password123', SALT),
        role: 'professor',
        name: 'RIMASYA AYU JAENINGSIH',
        department: 'System Informatics',
      },
    ],
  });

  console.log('Seed selesai!');
}

main().finally(() => prisma.$disconnect());
