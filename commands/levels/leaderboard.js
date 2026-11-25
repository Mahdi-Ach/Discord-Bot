const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../database/members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top 10 du serveur'),
  async execute(interaction) {
    const rows = await getLeaderboard(interaction.guild.id, 10);

    const desc = rows.length
      ? rows.map((r, i) => {
          const lvl = Math.floor(0.1 * Math.sqrt(r.xp));  // calcul local
          return `**${i + 1}.** <@${r.userId}> — ${r.xp} XP (niv. ${lvl})`;
        }).join('\n')
      : 'Aucune donnée pour l’instant.';

    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement')
      .setDescription(desc)
      .setColor(0xffd700);

    await interaction.reply({ embeds: [embed] });
  },
};