const { Events } = require("discord.js");
const { MemberRemove } = require("../database/members");

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    console.log("✅ guildMemberRemove event loaded");
    try {
      const { guild, user } = member;
        console.log("--------")
      await MemberRemove(guild.id, user.id);

      console.log(
        `🗑️ ${user.tag} left ${guild.name}. GuildMember data deleted.`,
      );
    } catch (error) {
      console.error("❌ guildMemberRemove error:", error);
    }
  },
};
