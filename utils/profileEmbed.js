
const { EmbedBuilder } = require('discord.js');

function createProfileEmbed(target, u) {
  return new EmbedBuilder()
    .setTitle(`👤 ${u.username}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: 'Langue', value: u.language, inline: true },
      {
        name: 'DM',
        value: u.dmEnabled ? '✅ Activés' : '❌ Désactivés',
        inline: true,
      },
      { name: 'Bot', value: u.bot ? 'Oui' : 'Non', inline: true },
      {
        name: 'Créé le',
        value: `<t:${Math.floor(u.createdAt.getTime() / 1000)}:D>`,
        inline: true,
      },
      {
        name: 'Vu le',
        value: u.lastSeenAt
          ? `<t:${Math.floor(u.lastSeenAt.getTime() / 1000)}:R>`
          : '—',
        inline: true,
      },
    )
    .setColor(0x5865f2)
    .setFooter({ text: `ID : ${u.id}` });
}

module.exports = { createProfileEmbed };
