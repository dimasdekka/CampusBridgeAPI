import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hapus semua supervision
  await prisma.supervision.deleteMany({});

  // Tambahkan data supervision contoh
  await prisma.supervision.createMany({
    data: [
      {
        id: '9j5ljw1dh',
        studentId: '221091750079',
        professorId: '0000001',
        dateTime: new Date('2025-03-11T13:15:29.364Z'),
        status: 'Pending',
        notes: 'Bimbingan 1',
      },
      {
        id: '9j51ga1dh',
        studentId: '221091750079',
        professorId: '0000001',
        dateTime: new Date('2025-03-18T13:15:29.364Z'),
        status: 'Pending',
        notes: 'Bimbingan 2',
      },
    ],
  });

  console.log('Seed supervision selesai!');
}

main().finally(() => prisma.$disconnect());
