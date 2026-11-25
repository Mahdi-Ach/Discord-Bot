const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison du ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') ?? 'Aucune raison';

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Tu ne peux pas te bannir.', ephemeral: true });
    }
    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ Je ne peux pas me bannir.', ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(target.id, { reason });

      const embed = new EmbedBuilder()
        .setTitle('🔨 Bannissement')
        .setDescription(`<@${target.id}> a été banni.`)
        .addFields(
          { name: 'Raison', value: reason, inline: false },
          { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
        )
        .setColor(0xed4245)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error('ban error:', e.message);
      await interaction.reply({
        content: '❌ Impossible de bannir (permissions ou hiérarchie des rôles ?).',
        ephemeral: true,
      });
    }
  },
};