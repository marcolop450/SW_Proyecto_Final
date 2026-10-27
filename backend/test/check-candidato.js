require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuario.findUnique({
    where: { correo: 'candidato.demo@gmail.com' },
    include: { consentimientos: true },
  });
  console.log('Candidato:', user?.id, 'Consents:', JSON.stringify(user?.consentimientos, null, 2));
}

main().finally(() => prisma.$disconnect());
