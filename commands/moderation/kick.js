const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison du kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') ?? 'Aucune raison';

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Tu ne peux pas t’expulser.', ephemeral: true });
    }
    if (target.id === interaction.client.user.id) {
      return interaction.reply({ content: '❌ Je ne peux pas m’expulser.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Membre introuvable sur ce serveur.', ephemeral: true });
    }
    if (!member.kickable) {
      return interaction.reply({ content: '❌ Je ne peux pas expulser ce membre (rôle trop haut).', ephemeral: true });
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle('👢 Expulsion')
        .setDescription(`<@${target.id}> a été expulsé.`)
        .addFields(
          { name: 'Raison', value: reason, inline: false },
          { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
        )
        .setColor(0xfaa61a)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error('kick error:', e.message);
      await interaction.reply({
        content: '❌ Impossible d’expulser (permissions ?).',
        ephemeral: true,
      });
    }
  },
};