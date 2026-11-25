require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,  // ← important
  ],
});
client.commands = new Collection();

const loadCommands = (dir) => {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) loadCommands(full);
    else if (file.endsWith('.js')) {
      const cmd = require(full);
      client.commands.set(cmd.data.name, cmd);
      console.log(`✅ Commande : ${cmd.data.name}`);
    }
  }
};
loadCommands(path.join(__dirname, 'commands'));

// Charger les événements
for (const file of fs.readdirSync(path.join(__dirname, 'events'))) {
  
  if (!file.endsWith('.js')) continue;
  const ev = require(`./events/${file}`);
  if (ev.once) client.once(ev.name, (...a) => ev.execute(...a));
  else client.on(ev.name, (...a) => ev.execute(...a));
}

client.once('clientReady', () => console.log(`🟢 Connecté : ${client.user.tag}`));
client.login(process.env.TOKEN);