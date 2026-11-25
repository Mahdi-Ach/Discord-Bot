const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Mute temporairement un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à mute').setRequired(true))
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('Durée en minutes (1-10080)').setRequired(true)
        .setMinValue(1).setMaxValue(10080))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('raison') ?? 'Aucune raison';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!member.moderatable) {
      return interaction.reply({ content: '❌ Je ne peux pas mute ce membre (rôle trop haut).', ephemeral: true });
    }

    await member.timeout(minutes * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setTitle('⏳ Timeout')
      .setDescription(`<@${target.id}> a été mute pour **${minutes} min**.`)
      .addFields(
        { name: 'Raison', value: reason, inline: false },
        { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
      )
      .setColor(0xfaa61a)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};