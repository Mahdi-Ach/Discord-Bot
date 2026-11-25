const prisma = require('./prisma');

/**
 * Crée ou met à jour l'utilisateur à chaque interaction.
 * Appelé dans interactionCreate / messageCreate.
 */
async function ensureUser(discordUser) {
  return prisma.user.upsert({
    where: { id: discordUser.id },
    update: {
      username:    discordUser.username,
      displayName: discordUser.globalName ?? null,
      avatar:      discordUser.avatar,
      lastSeenAt:  new Date(),
    },
    create: {
      id:          discordUser.id,
      username:    discordUser.username,
      displayName: discordUser.globalName ?? null,
      avatar:      discordUser.avatar,
      bot:         discordUser.bot,
      lastSeenAt:  new Date(),
    },
  });
}

/** Récupère un utilisateur par son ID Discord. */
async function getUser(userId) {
  return prisma.user.findUnique({ where: { id: userId } });
}

/** Change la langue préférée d'un utilisateur. */
async function setLanguage(userId, language) {
  return prisma.user.update({
    where: { id: userId },
    data:  { language },
  });
}

/** Active/désactive les DM du bot pour un utilisateur. */
async function setDmEnabled(userId, dmEnabled) {
  return prisma.user.update({
    where: { id: userId },
    data:  { dmEnabled },
  });
}

/** Supprime toutes les données d'un utilisateur (RGPD). */
async function deleteUser(userId) {
  // ON DELETE CASCADE nettoiera GuildMember, Warn, Ticket, etc.
  return prisma.user.delete({ where: { id: userId } });
}

module.exports = {
  ensureUser,
  getUser,
  setLanguage,
  setDmEnabled,
  deleteUser,
};