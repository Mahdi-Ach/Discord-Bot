const { ensureGuild } = require('../database/guilds');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      await ensureGuild(guild);
      console.log(`✅ Bot ajouté à ${guild.name} (${guild.id})`);
    } catch (e) {
      console.error('❌ guildCreate error:', e.message);
    }
  },
};