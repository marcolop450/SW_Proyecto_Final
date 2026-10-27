const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    include: {
      consents: true,
      membresias: true,
    },
  });
  for (const u of users) {
    console.log(u.correo, 'Consents:', u.consents.length);
    for (const c of u.consents) {
      console.log('  -', c.type, 'accepted:', c.isAccepted, 'revoked:', c.revokedAt);
    }
  }
}

main().finally(() => prisma.$disconnect());
