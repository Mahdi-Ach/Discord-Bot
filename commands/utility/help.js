const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { COMMAND_PERMISSIONS } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Liste les commandes que tu peux utiliser'),
  async execute(interaction) {
    const member = interaction.member;
    const me = interaction.guild.members.me;

    // Toutes les commandes chargées
    const commands = [...interaction.client.commands.values()];

    // Catégories (comme avant)
    const CATEGORIES = {
      '🟢 Utilitaires':  ['ping', 'help'],
      '📊 Niveaux':      ['rank', 'leaderboard'],
      '🛡️ Modération':   ['warn', 'warns', 'clear', 'clearwarns', 'ban', 'unban', 'kick',
                          'timeout', 'untimeout', 'slowmode', 'softban', 'banlist'],
      '👤 Utilisateur':  ['profile', 'setlang', 'mydata'],
      '⚙️ Configuration':['prefix'],
    };

    // Filtre les commandes accessibles à l'utilisateur
    const accessible = commands.filter(cmd => {
      const config = COMMAND_PERMISSIONS[cmd.data.name];
      if (!config) return true; // pas configurée → accessible

      // L'user a les permissions ?
      const userOk = !config.user || config.user.every(p => member.permissions.has(p));

      // Le bot a les permissions (rôle) ?
      const botOk = !config.bot || config.bot.every(p => me.permissions.has(p));

      return userOk && botOk;
    });

    // Groupe par catégorie
    const grouped = {};
    for (const cmd of accessible) {
      const name = cmd.data.name;
      let cat = '📦 Autres';
      for (const [c, list] of Object.entries(CATEGORIES)) {
        if (list.includes(name)) { cat = c; break; }
      }
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(`\`/${name}\` — ${cmd.data.description}`);
    }

    // Construit la description
    let desc = '';
    for (const [cat, cmds] of Object.entries(grouped)) {
      desc += `**${cat}**\n${cmds.join('\n')}\n\n`;
    }

    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    const embed = new EmbedBuilder()
      .setTitle('📖 Commandes disponibles pour toi')
      .setDescription(desc.slice(0, 4000) || 'Aucune commande accessible.')
      .setColor(isAdmin ? 0xed4245 : 0x5865f2)
      .setFooter({ text: `${accessible.length} commande(s) accessible(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};