
const { SlashCommandBuilder } = require('discord.js');
const { ensureUser, getUser } = require('../../database/users');
const { createProfileEmbed } = require('../../utils/profileEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Affiche ton profil'),

  async execute(interaction) {
    const target = interaction.user;

    await ensureUser(target);
    const u = await getUser(target.id);

    const embed = createProfileEmbed(target, u);

    await interaction.reply({ embeds: [embed] });
  },
};
