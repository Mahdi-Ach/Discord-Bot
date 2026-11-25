const { queueXp } = require('../database/xpBuffer');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (!message.guild || message.author.bot) return;
    queueXp(message.guild.id, message.author.id, 5); 
  },
};