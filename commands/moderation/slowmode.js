const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Définit le mode lent du salon')
    .addIntegerOption(o =>
      o.setName('secondes').setDescription('0 = désactivé (max 21600)').setRequired(true)
        .setMinValue(0).setMaxValue(21600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(interaction.channel.type)) {
      return interaction.reply({ content: '❌ Commande uniquement dans un salon texte.', ephemeral: true });
    }

    const seconds = interaction.options.getInteger('secondes');
    await interaction.channel.setRateLimitPerUser(seconds);

    await interaction.reply({
      content: seconds === 0
        ? '✅ Mode lent désactivé.'
        : `🐢 Mode lent : **${seconds} s** entre chaque message.`,
      ephemeral: true,
    });
  },
};