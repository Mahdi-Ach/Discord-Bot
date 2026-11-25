const { PermissionsBitField } = require("discord.js");

const COMMAND_PERMISSIONS = {
  // Utilitaires
  ping: { bot: [], user: [] },
  help: { bot: [], user: [] },
  "profile-user": {
    bot: [],
    user: [PermissionsBitField.Flags.Administrator],
  },
  // Niveaux
  rank: { bot: [], user: [] },
  leaderboard: { bot: [], user: [] },

  // Modération
  poll: {
    bot: [
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.EmbedLinks,
    ],
    user: [PermissionsBitField.Flags.ManageGuild],
  },
  warn: {
    bot: [PermissionsBitField.Flags.ModerateMembers],
    user: [PermissionsBitField.Flags.ModerateMembers],
  },
  warns: { bot: [], user: [PermissionsBitField.Flags.ModerateMembers] }, // ← CORRIGÉ : modos seulement
  clearwarns: {
    bot: [PermissionsBitField.Flags.ModerateMembers],
    user: [PermissionsBitField.Flags.ModerateMembers],
  },
  clear: {
    bot: [PermissionsBitField.Flags.ManageMessages],
    user: [PermissionsBitField.Flags.ManageMessages],
  },
  ban: {
    bot: [PermissionsBitField.Flags.BanMembers],
    user: [PermissionsBitField.Flags.BanMembers],
  },
  unban: {
    bot: [PermissionsBitField.Flags.BanMembers],
    user: [PermissionsBitField.Flags.BanMembers],
  },
  kick: {
    bot: [PermissionsBitField.Flags.KickMembers],
    user: [PermissionsBitField.Flags.KickMembers],
  },
  timeout: {
    bot: [PermissionsBitField.Flags.ModerateMembers],
    user: [PermissionsBitField.Flags.ModerateMembers],
  },
  untimeout: {
    bot: [PermissionsBitField.Flags.ModerateMembers],
    user: [PermissionsBitField.Flags.ModerateMembers],
  },
  softban: {
    bot: [PermissionsBitField.Flags.BanMembers],
    user: [PermissionsBitField.Flags.BanMembers],
  },
  banlist: {
    bot: [PermissionsBitField.Flags.BanMembers],
    user: [PermissionsBitField.Flags.BanMembers],
  },
  // Commandes de salon
  slowmode: {
    bot: [PermissionsBitField.Flags.ManageChannels],
    user: [PermissionsBitField.Flags.ManageChannels],
    channel: [PermissionsBitField.Flags.ManageChannels],
  },

  // Utilisateurs
  profile: { bot: [], user: [] },
  setlang: { bot: [], user: [] },
  mydata: { bot: [], user: [] },
};

function checkPermissions(interaction, commandName) {
  const config = COMMAND_PERMISSIONS[commandName];
  if (!config) return { ok: true };

  const me = interaction.guild.members.me;
  const member = interaction.member;

  // 1. Permissions du BOT (rôle global)
  const botMissing = config.bot.filter((p) => !me.permissions.has(p));
  if (botMissing.length > 0) {
    return {
      ok: false,
      reason: `❌ Il me manque les permissions : ${botMissing.map((p) => `\`${new PermissionsBitField(p).toArray().join(", ")}\``).join(", ")}`,
    };
  }

  // 2. Permissions du BOT DANS LE SALON (si défini)
  if (config.channel) {
    const botChannelPerms = interaction.channel.permissionsFor(me);
    const channelMissing = config.channel.filter(
      (p) => !botChannelPerms.has(p),
    );
    if (channelMissing.length > 0) {
      return {
        ok: false,
        reason: `❌ Il me manque les permissions **dans ce salon** : ${channelMissing.map((p) => `\`${new PermissionsBitField(p).toArray().join(", ")}\``).join(", ")}`,
      };
    }
  }

  // 3. Permissions de L'UTILISATEUR
  const userMissing = config.user.filter((p) => !member.permissions.has(p));
  if (userMissing.length > 0) {
    return {
      ok: false,
      reason: `❌ Tu n'as pas les permissions requises : ${userMissing.map((p) => `\`${new PermissionsBitField(p).toArray().join(", ")}\``).join(", ")}`,
    };
  }

  return { ok: true };
}

module.exports = { COMMAND_PERMISSIONS, checkPermissions };
