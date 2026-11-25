const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime des messages dans ce salon')
    .addIntegerOption(o =>
      o.setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.reply({
        content: `🧹 ${deleted.size} message(s) supprimé(s).`,
        ephemeral: true,
      });
    } catch (e) {
      console.error('clear error:', e.message);
      await interaction.reply({
        content: '❌ Impossible de supprimer (messages trop anciens ?).',
        ephemeral: true,
      });
    }
  },
};