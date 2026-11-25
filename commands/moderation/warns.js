const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { listWarns } = require('../../database/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Liste les avertissements d’un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre ciblé').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const rows = await listWarns(interaction.guild.id, target.id);

    if (rows.length === 0) {
      return interaction.reply({ content: `✅ <@${target.id}> n’a aucun avertissement.`, ephemeral: true });
    }

    const desc = rows.map((w, i) =>
      `**${i + 1}.** ${w.reason ?? '—'} — par <@${w.modId ?? '?'}> (<t:${Math.floor(w.createdAt.getTime() / 1000)}:R>)`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warns de ${target.username} (${rows.length})`)
      .setDescription(desc)
      .setColor(0xffaa00);

    await interaction.reply({ embeds: [embed] });
  },
};