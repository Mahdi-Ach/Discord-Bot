const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur par son ID')
    .addStringOption(o =>
      o.setName('userid')
        .setDescription('ID Discord de l’utilisateur banni')
        .setRequired(true))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison du déban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('userid').trim();
    const reason = interaction.options.getString('raison') ?? 'Aucune raison';

    // Vérifie que c'est un ID numérique valide
    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: '❌ ID invalide. Fournis un ID Discord (17-20 chiffres).',
        ephemeral: true,
      });
    }

    try {
      // Vérifie que l'utilisateur est bien banni
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        return interaction.reply({
          content: `❌ <@${userId}> n’est pas banni de ce serveur.`,
          ephemeral: true,
        });
      }

      await interaction.guild.members.unban(userId, reason);

      const embed = new EmbedBuilder()
        .setTitle('🔓 Débannissement')
        .setDescription(`<@${userId}> a été débanni.`)
        .addFields(
          { name: 'Raison', value: reason, inline: false },
          { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
        )
        .setColor(0x57f287)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error('unban error:', e.message);
      await interaction.reply({
        content: '❌ Impossible de débannir (permissions ?).',
        ephemeral: true,
      });
    }
  },
};