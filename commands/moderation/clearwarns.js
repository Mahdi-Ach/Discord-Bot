const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { clearWarns } = require('../../database/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Supprime tous les warns d’un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre ciblé').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');

    await clearWarns(interaction.guild.id, target.id).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('🧹 Warns effacés')
      .setDescription(`Tous les avertissements de <@${target.id}> ont été supprimés.`)
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};