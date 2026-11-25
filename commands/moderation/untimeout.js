const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Retire le timeout d’un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à unmute').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: '❌ Ce membre n’est pas en timeout.', ephemeral: true });
    }

    await member.timeout(null);

    const embed = new EmbedBuilder()
      .setTitle('✅ Timeout retiré')
      .setDescription(`<@${target.id}> n’est plus mute.`)
      .setColor(0x57f287)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};