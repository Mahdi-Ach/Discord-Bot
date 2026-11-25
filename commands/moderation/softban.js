const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban + unban immédiat (supprime les messages récents)')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à softban').setRequired(true))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') ?? 'Softban';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    if (!member.bannable) {
      return interaction.reply({ content: '❌ Je ne peux pas softban ce membre.', ephemeral: true });
    }

    await member.ban({ reason, deleteMessageSeconds: 7 * 24 * 60 * 60 });
    await interaction.guild.members.unban(target.id, 'Softban — unban immédiat');

    const embed = new EmbedBuilder()
      .setTitle('🧹 Softban')
      .setDescription(`<@${target.id}> a été softban (messages des 7 derniers jours supprimés).`)
      .addFields(
        { name: 'Raison', value: reason, inline: false },
        { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
      )
      .setColor(0xed4245)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};