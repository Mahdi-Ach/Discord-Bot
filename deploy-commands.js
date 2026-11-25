require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const load = (dir) => {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) { load(full); continue; }
    if (!file.endsWith('.js')) continue;
    const cmd = require(full);
    console.log('📦', file, '| data?', !!cmd.data);   // ← AJOUT
    commands.push(cmd.data.toJSON());
  }
};
load(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Enregistrement de ${commands.length} commande(s)...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commandes enregistrées !');
  } catch (e) {
    console.error(e);
  }
})();