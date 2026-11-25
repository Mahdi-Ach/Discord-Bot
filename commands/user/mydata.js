const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, deleteUser } = require('../../database/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mydata')
    .setDescription('Gère tes données personnelles')
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('Voir les données que le bot stocke sur toi'))
    .addSubcommand(sub =>
      sub.setName('delete')
        .setDescription('Supprimer toutes tes données (irréversible)')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // ─── VOIR SES DONNÉES ───
    if (sub === 'view') {
      const u = await getUser(interaction.user.id);
      if (!u) {
        return interaction.reply({
          content: '📭 Aucune donnée stockée sur toi.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🔍 Tes données')
        .setDescription('Voici ce que le bot stocke sur toi.')
        .addFields(
          { name: 'ID', value: `\`${u.id}\``, inline: false },
          { name: 'Username', value: u.username, inline: true },
          { name: 'Langue', value: u.language, inline: true },
          { name: 'DM', value: u.dmEnabled ? '✅' : '❌', inline: true },
          { name: 'Créé le', value: `<t:${Math.floor(u.createdAt.getTime() / 1000)}:F>`, inline: false },
        )
        .setColor(0x5865f2);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ─── SUPPRIMER SES DONNÉES ───
    if (sub === 'delete') {
      await deleteUser(interaction.user.id).catch(() => {});

      await interaction.reply({
        content: '🗑️ **Toutes tes données ont été supprimées** (XP, niveaux, warns, profil). Cette action est irréversible.',
        ephemeral: true,
      });
    }
  },
};