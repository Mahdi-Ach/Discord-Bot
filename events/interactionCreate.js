const { checkPermissions } = require("../utils/permissions");
const { polls, buildMessage } = require("../utils/poll");
const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isButton() && interaction.customId === "ticket:create") {
      await interaction.deferReply({ ephemeral: true });
      const { guild, user } = interaction;

      // One open ticket per user (the user's id is stored in the channel topic)
      const existing = guild.channels.cache.find(
        (c) =>
          c.parentId === process.env.TICKET_CATEGORY_ID && c.topic === user.id,
      );
      if (existing) {
        return interaction.editReply(`You already have a ticket: ${existing}`);
      }

      const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: "1479375114494808155",
        topic: user.id,
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: process.env.OWNER_ROLE_ID,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
      });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:close")
          .setLabel("Close ticket")
          .setStyle(ButtonStyle.Danger),
      );

      // This ping is your notification: staff get alerted in the new room
      await channel.send({
        content: `<@&${process.env.OWNER_ROLE_ID}> ${user} just opened a ticket.`,
        components: [closeRow],
      });

      return interaction.editReply(
        `✅ Your ticket has been created: ${channel}`,
      );
    }

    // 🔒 Close ticket
    if (interaction.isButton() && interaction.customId === "ticket:close") {
      await interaction.reply("🔒 Closing in 5 seconds...");
      return setTimeout(
        () => interaction.channel.delete().catch(console.error),
        5000,
      );
    }
    // 🔘 Poll vote buttons (no permission check: anyone can vote)
    if (interaction.isButton() && interaction.customId.startsWith("poll:")) {
      const [, pollId, idx] = interaction.customId.split(":");
      const poll = polls.get(pollId);

      if (!poll) {
        return interaction.reply({
          content: "❌ Ce sondage a expiré.",
          ephemeral: true,
        });
      }
      // Also compare against endsAt in case the close timer hasn't fired yet
      if (poll.ended || Date.now() >= poll.endsAt) {
        return interaction.reply({
          content: "🔒 Le vote est terminé.",
          ephemeral: true,
        });
      }

      poll.votes.set(interaction.user.id, Number(idx)); // 1 vote per user, changeable
      return interaction.update({ ...buildMessage(pollId), attachments: [] });
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // ✅ Vérification centralisée des permissions
    const perm = checkPermissions(interaction, interaction.commandName);
    if (!perm.ok) {
      return interaction.reply({ content: perm.reason, ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const msg = { content: "❌ Une erreur est survenue.", ephemeral: true };
      if (interaction.replied || interaction.deferred)
        await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
  },
};
