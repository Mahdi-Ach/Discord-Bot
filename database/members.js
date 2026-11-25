const prisma = require('./prisma');
const { getBuffered } = require('./xpBuffer');

// Calcule le niveau à partir de l'XP
function computeLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

// Récupère (ou crée) un membre en base
async function getMember(guildId, userId) {
  return prisma.guildMember.upsert({
    where:  { guildId_userId: { guildId, userId } },
    update: {},
    create: { guildId, userId },
  });
}

// XP total = base + buffer (temps réel)
async function getMemberWithBuffer(guildId, userId) {
  const db  = await getMember(guildId, userId);
  const buf = getBuffered(guildId, userId);
  const xp  = db.xp + buf.xp;
  return {
    ...db,
    xp,
    messages: db.messages + buf.messages,
    level: computeLevel(xp),
  };
}

async function addXp(guildId, userId, amount) {
  return prisma.guildMember.upsert({
    where:  { guildId_userId: { guildId, userId } },
    update: {
      xp:       { increment: amount },
      messages: { increment: 1 },
    },
    create: { guildId, userId, xp: amount, messages: 1 },
  });
}

async function getLeaderboard(guildId, limit = 10) {
  return prisma.guildMember.findMany({
    where:   { guildId },
    orderBy: { xp: 'desc' },
    take:    limit,
    include: { user: { select: { username: true } } },
  });
}

async function MemberRemove(guildId,userId) {
  console.log(guildId,userId)
      return await prisma.guildMember.deleteMany({
        where: {
          guildId: guildId,
          userId: userId,
        },
      });
}
module.exports = { getMember, getMemberWithBuffer, addXp, getLeaderboard ,MemberRemove};