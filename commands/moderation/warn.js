const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ensureUser }  = require('../../database/users');
const { ensureGuild } = require('../../database/guilds');
const { addWarn }     = require('../../database/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre')
    .addUserOption(o =>
      o.setName('membre').setDescription('Membre à avertir').setRequired(true))
    .addStringOption(o =>
      o.setName('raison').setDescription('Raison du warn'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') ?? 'Aucune raison';

    // Sécurités
    if (target.bot) {
      return interaction.reply({ content: '❌ Impossible de warn un bot.', ephemeral: true });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Tu ne peux pas te warn toi-même.', ephemeral: true });
    }

    await ensureGuild(interaction.guild);
    await ensureUser(target);
    await ensureUser(interaction.user);

    await addWarn(interaction.guild.id, target.id, interaction.user.id, reason);

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Avertissement')
      .setDescription(`<@${target.id}> a reçu un avertissement.`)
      .addFields(
        { name: 'Raison', value: reason, inline: false },
        { name: 'Modérateur', value: `<@${interaction.user.id}>`, inline: true },
      )
      .setColor(0xffaa00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};