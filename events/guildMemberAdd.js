const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID;

    try {
      await member.roles.add(MEMBER_ROLE_ID);
      console.log(`✅ Member role added to ${member.user.tag}`);
    } catch (error) {
      console.error('❌ Role assignment failed:', error.message);
    }

    // 2. Send welcome message
    try {
      const channel = member.guild.systemChannel;

      if (channel) {
        await channel.send(
          `👋 Welcome ${member}! You have received the **Member** role.`
        );

        console.log('✅ Welcome message sent');
      } else {
        console.log('⚠️ No system channel configured.');
      }
    } catch (error) {
      console.error('❌ Welcome message failed:', error.message);
    }
  },
};