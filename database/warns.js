const prisma = require('./prisma');

/** Ajoute un warn + incrémente le compteur du membre. */
async function addWarn(guildId, userId, modId, reason) {
  return prisma.$transaction([
    prisma.warn.create({
      data: { guildId, userId, modId, reason },
    }),
    prisma.guildMember.upsert({
      where:  { guildId_userId: { guildId, userId } },
      update: { warns: { increment: 1 } },
      create: { guildId, userId, warns: 1 },
    }),
  ]);
}

/** Liste les warns d'un membre (plus récents d'abord). */
async function listWarns(guildId, userId) {
  return prisma.warn.findMany({
    where:   { guildId, userId },
    orderBy: { createdAt: 'desc' },
    include: { moderator: { select: { username: true } } },
  });
}

/** Supprime tous les warns d'un membre. */
async function clearWarns(guildId, userId) {
  return prisma.$transaction([
    prisma.warn.deleteMany({ where: { guildId, userId } }),
    prisma.guildMember.update({
      where: { guildId_userId: { guildId, userId } },
      data:  { warns: 0 },
    }),
  ]);
}

module.exports = { addWarn, listWarns, clearWarns };