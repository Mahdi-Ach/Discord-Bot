const prisma = require('./prisma');

async function ensureGuild(discordGuild) {
  return prisma.guild.upsert({
    where: { id: discordGuild.id },
    update: { name: discordGuild.name },
    create: { id: discordGuild.id, name: discordGuild.name },
  });
}

/** Récupère un serveur par son ID Discord. */
async function getGuild(guildId) {
  return prisma.guild.findUnique({ where: { id: guildId } });
}

/** Change le préfixe du serveur. */
async function setPrefix(guildId, prefix) {
  return prisma.guild.update({
    where: { id: guildId },
    data:  { prefix },
  });
}

/** Supprime le serveur (et ses données liées via CASCADE). */
async function deleteGuild(guildId) {
  return prisma.guild.delete({ where: { id: guildId } });
}

module.exports = {
  ensureGuild,
  getGuild,
  setPrefix,
  deleteGuild,
};