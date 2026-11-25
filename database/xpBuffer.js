const prisma = require('./prisma');

const pending = new Map();
let flushing = false;   // ← AJOUT 1 : verrou

function queueXp(guildId, userId, xp = 5) {
  const key = `${guildId}:${userId}`;
  const cur = pending.get(key) ?? { guildId, userId, xp: 0, messages: 0 };
  cur.xp += xp;
  cur.messages += 1;
  pending.set(key, cur);
  if (pending.size >= 5000) flush().catch(console.error);
}

function requeue(b) {
  const key = `${b.guildId}:${b.userId}`;
  const cur = pending.get(key) ?? { guildId: b.guildId, userId: b.userId, xp: 0, messages: 0 };
  cur.xp += b.xp;
  cur.messages += b.messages;
  pending.set(key, cur);
}

async function flush() {
  if (flushing) return;          // ← AJOUT 2a : déjà en cours → on sort
  if (pending.size === 0) return;

  flushing = true;               // ← AJOUT 2b : on verrouille
  try {
    const batch = [...pending.values()];
    pending.clear();

    const CHUNK = 100;
    for (let i = 0; i < batch.length; i += CHUNK) {
      const slice = batch.slice(i, i + CHUNK);
      try {
        await prisma.$transaction(
          slice.map(b =>
            prisma.guildMember.upsert({
              where:  { guildId_userId: { guildId: b.guildId, userId: b.userId } },
              update: {
                xp:       { increment: b.xp },
                messages: { increment: b.messages },
              },
              create: {
                guildId:  b.guildId,
                userId:   b.userId,
                xp:       b.xp,
                messages: b.messages,
              },
            })
          )
        );
        console.log(`✅ Flush ${slice.length} membre(s)`);
      } catch (e) {
        console.error('❌ flush chunk error:', e.message);
        slice.forEach(requeue);
      }
    }
  } finally {
    flushing = false;            // ← AJOUT 2c : on déverrouille TOUJOURS
  }
}

function getBuffered(guildId, userId) {
  return pending.get(`${guildId}:${userId}`) ?? { xp: 0, messages: 0 };
}

const timer = setInterval(flush, 10_000);

async function shutdown() {
  clearInterval(timer);
  await flush();
  process.exit(0);
}
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);

module.exports = { queueXp, flush, getBuffered, pending };