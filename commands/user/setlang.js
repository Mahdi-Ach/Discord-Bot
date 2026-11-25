const { SlashCommandBuilder } = require('discord.js');
const { ensureUser, setLanguage } = require('../../database/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlang')
    .setDescription('Change ta langue préférée')
    .addStringOption(o =>
      o.setName('langue')
        .setDescription('Choisis ta langue')
        .setRequired(true)
        .addChoices(
          { name: '🇫🇷 Français', value: 'fr' },
          { name: '🇬🇧 English', value: 'en' },
        )),
  async execute(interaction) {
    const lang = interaction.options.getString('langue');

    await ensureUser(interaction.user);
    await setLanguage(interaction.user.id, lang);

    await interaction.reply({
      content: `🌐 Langue définie sur **${lang === 'fr' ? 'Français' : 'English'}**.`,
      ephemeral: true,
    });
  },
};