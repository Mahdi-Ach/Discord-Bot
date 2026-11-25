
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ensureUser, getUser } = require('../../database/users');
const { createProfileEmbed } = require('../../utils/profileEmbed');
const config = require('../../config.json');

module.exports = {
data: new SlashCommandBuilder()
  .setName('profile-user')
  .setDescription('Affiche le profil d’un autre membre')
  .addUserOption(option =>
    option
      .setName('membre')
      .setDescription('Le membre à consulter')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const isOwner = interaction.user.id === config.ownerId;
    const isAdmin = interaction.memberPermissions?.has(
      PermissionFlagsBits.Administrator
    );

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: '❌ Tu n’as pas la permission d’utiliser cette commande.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('membre');

    await ensureUser(target);
    const u = await getUser(target.id);

    const embed = createProfileEmbed(target, u);

    await interaction.reply({ embeds: [embed] });
  },
};
