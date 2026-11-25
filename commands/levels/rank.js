const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ensureUser }  = require('../../database/users');
const { ensureGuild } = require('../../database/guilds');
const { getMemberWithBuffer  }   = require('../../database/members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Affiche ton niveau')
    .addUserOption(o =>
      o.setName('membre').setDescription('Voir le rang d’un autre membre')),
  async execute(interaction) {
    const target = interaction.options.getUser('membre') ?? interaction.user;
    const guildId = interaction.guild.id;

    await ensureGuild(interaction.guild);
    await ensureUser(target);

    const m = await getMemberWithBuffer (guildId, target.id);

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'XP',       value: `${m.xp}`,       inline: true },
        { name: 'Niveau',   value: `${m.level}`,    inline: true },
        { name: 'Messages', value: `${m.messages}`, inline: true },
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  },
};