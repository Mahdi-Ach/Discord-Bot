const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Post the support ticket message in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.channel;
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🎟 Support Ticket")
      .setDescription(
        "Need help? Click the button below to create a private support ticket. " +
          "Our team will assist you as soon as possible.",
      )
      .setFooter({ text: "Support System" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket:create")
        .setLabel("Contact support")
        .setEmoji("🎟️")
        .setStyle(ButtonStyle.Primary),
    );

    await channel.send({ embeds: [embed], components: [row] });
    return interaction.editReply("✅ Ticket panel posted.");
  },
};
