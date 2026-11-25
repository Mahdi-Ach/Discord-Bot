const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { polls, buildMessage, parseDuration } = require('../../utils/poll');

const MAX_DURATION = 7 * 24 * 60 * 60 * 1000; 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a timed poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('options').setDescription('Comma separated, 2-5 options').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('e.g. 30s, 10m, 2h, 1d').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const options = interaction.options.getString('options')
      .split(',').map(s => s.trim()).filter(Boolean);
    const duration = parseDuration(interaction.options.getString('duration'));

    if (options.length < 2 || options.length > 5) {
      return interaction.reply({ content: 'Give between 2 and 5 options.', ephemeral: true });
    }
    if (!duration || duration < 10_000 || duration > MAX_DURATION) {
      return interaction.reply({
        content: 'Invalid duration. Use something like `30s`, `10m`, `2h` or `1d` (10s to 7d).',
        ephemeral: true,
      });
    }

    const pollId = interaction.id;
    polls.set(pollId, {
      question: interaction.options.getString('question'),
      options,
      votes: new Map(),
      endsAt: Date.now() + duration,
      ended: false,
    });

    await interaction.reply(buildMessage(pollId));
    const message = await interaction.fetchReply();
    
    setTimeout(async () => {
      const poll = polls.get(pollId);
      if (!poll) return;
      poll.ended = true;
      try {
        await message.edit({ ...buildMessage(pollId), attachments: [] });
      } catch (err) {
        console.error('Could not close poll message:', err);
      }
      setTimeout(() => polls.delete(pollId), 60 * 60 * 1000); 
    }, duration);
  },
};