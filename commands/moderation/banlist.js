const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('Liste les utilisateurs bannis')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      return interaction.reply({ content: '✅ Aucun utilisateur banni.', ephemeral: true });
    }
    const desc = bans.map(b =>
      `• **${b.user.tag}** — \`${b.user.id}\`${b.reason ? ` — ${b.reason}` : ''}`
    ).join('\n');
    const embed = new EmbedBuilder()
      .setTitle(`🔨 Bannis (${bans.size})`)
      .setDescription(desc.slice(0, 4000))
      .setColor(0xed4245);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};