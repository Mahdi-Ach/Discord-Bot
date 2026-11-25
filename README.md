# 🤖 Bot Discord — Documentation complète

Bot Discord développé en **Node.js** avec **discord.js v14** et **Prisma 7** (PostgreSQL).  
Il reproduit les fonctionnalités principales de MEE6 : **niveaux**, **modération**, **profils**, **sondages** et **permissions centralisées**.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Commandes](#-commandes)
- [Base de données](#-base-de-données)
- [Système de niveaux (XP)](#-système-de-niveaux-xp)
- [Permissions centralisées](#-permissions-centralisées)
- [Permissions du bot](#-permissions-du-bot)
- [Déploiement des commandes](#-déploiement-des-commandes)
- [Lancer le bot](#-lancer-le-bot)
- [Dépannage](#-dépannage)

---

## ✨ Fonctionnalités

### 🎮 Niveaux & XP
- XP automatique par message (+5 XP)
- Buffer mémoire pour éviter de surcharger la base (flush toutes les 10 s)
- Calcul du niveau : `level = floor(0.1 × √xp)`
- Classement du serveur (`/leaderboard`)

### 🛡️ Modération
- Avertissements (warns) avec historique
- Suppression de messages en masse
- Bannissement / débannissement / softban
- Expulsion (kick)
- Timeout temporaire
- Mode lent (slowmode)
- Liste des bannis
- Suppression des warns

### 👤 Utilisateurs
- Profil utilisateur (données bot)
- Profil détaillé d'un membre (`/profile-user`)
- Suppression des données (RGPD)

### 🎉 Fun & Utilitaires
- Sondages (`/poll`)
- Latence (`/ping`)
- Aide filtrée par rôle (`/help`)

### 🔐 Permissions
- **Centralisées** dans `utils/permissions.js`
- Vérification **bot + user + salon** avant exécution
- `/help` filtré **selon le rôle** de l'utilisateur

---

## 🛠 Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | 22.x | Runtime |
| **discord.js** | 14.x | API Discord |
| **Prisma** | 7.x | ORM |
| **PostgreSQL** | 16 | Base de données |
| **@prisma/adapter-pg** | 7.x | Driver PostgreSQL pour Prisma 7 |
| **dotenv** | 18.x | Variables d'environnement |
| **nodemon** | 3.x | Rechargement auto (dev) |

---

## 🚀 Installation

```bash
# 1. Cloner / créer le projet
mkdir discord-bot && cd discord-bot

# 2. Initialiser npm
npm init -y

# 3. Installer les dépendances
npm install discord.js dotenv @prisma/client @prisma/adapter-pg
npm install --save-dev prisma nodemon

# 4. Initialiser Prisma
npx prisma init
```

---

## ⚙️ Configuration

### `.env`

```env
# Discord
TOKEN=ton_token_ici
CLIENT_ID=ton_application_id
GUILD_ID=ton_serveur_id

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/discord"
```

### `prisma7.config.ts` (Prisma 7)

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
```

### `database/prisma.js` (client Prisma 7)

```js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter, log: ['warn', 'error'] });

process.on('beforeExit', async () => { await prisma.$disconnect(); });

module.exports = prisma;
```

### `.gitignore`

```
node_modules/
.env
src/generated/
*.db
```

---

## 📁 Structure du projet

```
discord-bot/
├── index.js                  # Point d'entrée
├── deploy-commands.js        # Enregistrement des slash commands
├── package.json
├── .env
├── prisma7.config.ts
│
├── prisma/
│   ├── schema.prisma         # Modèles (Guild, User, GuildMember, Warn…)
│   └── migrations/
│
├── src/generated/prisma/     # Client Prisma généré (Prisma 7)
│
├── database/
│   ├── prisma.js             # Client singleton
│   ├── users.js              # Requêtes User
│   ├── guilds.js             # Requêtes Guild
│   ├── members.js            # Requêtes GuildMember (XP)
│   ├── warns.js              # Requêtes Warn
│   └── xpBuffer.js           # Buffer XP (flush 10 s)
│
├── utils/
│   └── permissions.js        # Permissions centralisées
│
├── commands/
│   ├── utility/              # /ping /help /poll
│   ├── levels/               # /rank /leaderboard
│   ├── moderation/           # /warn /warns /clear /ban /kick /unban…
│   ├── config/               # /prefix
│   └── user/                 # /profile /profile-user /mydata
│
└── events/
    ├── interactionCreate.js  # Routeur slash commands + checkPermissions
    ├── messageCreate.js      # XP auto
    ├── guildCreate.js        # Bot rejoint un serveur
    ├── guildDelete.js        # Bot retiré d'un serveur
    └── guildMemberAdd.js     # Attribution du rôle Member (optionnel)
```

---

## 🎮 Commandes

### 🟢 Utilitaires
| Commande | Description |
|----------|-------------|
| `/ping` | Latence du bot |
| `/help` | Liste des commandes **accessibles selon ton rôle** |
| `/poll` | Créer un sondage |

### 📊 Niveaux
| Commande | Description |
|----------|-------------|
| `/rank [membre]` | Affiche XP, niveau, messages |
| `/leaderboard` | Top 10 du serveur |

### 🛡️ Modération
| Commande | Description | Permission |
|----------|-------------|------------|
| `/warn <membre> [raison]` | Avertir un membre | Moderate Members |
| `/warns <membre>` | Liste les warns | Moderate Members |
| `/clearwarns <membre>` | Supprime tous les warns | Moderate Members |
| `/clear <nombre>` | Supprime 1-100 messages | Manage Messages |
| `/ban <membre> [raison]` | Bannir | Ban Members |
| `/unban <userid> [raison]` | Débannir par ID | Ban Members |
| `/kick <membre> [raison]` | Expulser | Kick Members |
| `/timeout <membre> <minutes>` | Mute temporaire | Moderate Members |
| `/untimeout <membre>` | Retire le timeout | Moderate Members |
| `/slowmode <secondes>` | Mode lent du salon | Manage Channels |
| `/softban <membre> [raison]` | Ban + unban (supprime messages) | Ban Members |
| `/banlist` | Liste les utilisateurs bannis | Ban Members |

### 👤 Utilisateurs
| Commande | Description |
|----------|-------------|
| `/profile [membre]` | Ton profil (ou celui d'un autre si modo) |
| `/profile-user <membre>` | Infos détaillées d'un membre |
| `/mydata view` | Voir les données stockées sur toi |
| `/mydata delete` | Supprime toutes tes données (RGPD) |

### ⚙️ Configuration
| Commande | Description |
|----------|-------------|
| `/prefix [valeur]` | Affiche/change le préfixe |

---

## 🗄 Base de données

### Modèles Prisma

| Modèle | Rôle |
|--------|------|
| **Guild** | Configuration par serveur (préfixe…) |
| **User** | Identité globale (username, langue, DM) |
| **GuildMember** | Stats par serveur (XP, niveau, warns, coins) |
| **Warn** | Historique des avertissements |
| **RoleMenu** | Réactions de rôles (futur) |
| **CustomCommand** | Commandes personnalisées (futur) |
| **Ticket** | Système de support (futur) |

### Migrations

```bash
# Créer/appliquer une migration (dev)
npx prisma migrate dev --name nom_court

# Appliquer les migrations existantes (prod)
npx prisma migrate deploy

# Régénérer le client
npx prisma generate

# Interface visuelle
npx prisma studio
```

### Règles d'or

- **Toujours `guild_id` en premier** dans les index (multi-serveurs)
- **Clé composite `(guild_id, user_id)`** pour `GuildMember`
- **`ON DELETE CASCADE`** : quitter un serveur nettoie les données liées
- **`modId` optionnel** dans `Warn` (sinon erreur `SetNull`)

---

## 📈 Système de niveaux (XP)

### Fonctionnement

1. Chaque message → `queueXp(guildId, userId, 5)` en **mémoire**
2. Toutes les **10 s** → `flush()` écrit en base par **chunks de 100**
3. `/rank` lit **base + buffer** (temps réel)

### Fichiers clés

| Fichier | Rôle |
|---------|------|
| `events/messageCreate.js` | Appelle `queueXp` |
| `database/xpBuffer.js` | Buffer + flush périodique |
| `database/members.js` | `getMemberWithBuffer`, `getLeaderboard` |
| `commands/levels/rank.js` | Affiche XP + niveau |

### Formule de niveau

```js
level = Math.floor(0.1 * Math.sqrt(xp))
```

| Niveau | XP requis | Messages (5 XP) |
|--------|-----------|-----------------|
| 1 | 100 | 20 |
| 2 | 400 | 80 |
| 5 | 2 500 | 500 |
| 10 | 10 000 | 2 000 |

### Optimisations

- ✅ Buffer mémoire (évite 1 UPDATE/message)
- ✅ Flush par chunks de 100
- ✅ Verrou `flushing` (évite les flush concurrents)
- ✅ Flush d'urgence à 5000 entrées
- ✅ `SIGINT` / `SIGTERM` : flush propre à l'arrêt

---

## 🔐 Permissions centralisées

### `utils/permissions.js`

```js
const { PermissionsBitField } = require('discord.js');

const COMMAND_PERMISSIONS = {
  ping:  { bot: [], user: [] },
  warn:  { bot: [PermissionsBitField.Flags.ModerateMembers], user: [PermissionsBitField.Flags.ModerateMembers] },
  ban:   { bot: [PermissionsBitField.Flags.BanMembers], user: [PermissionsBitField.Flags.BanMembers] },
  // ...
};

function checkPermissions(interaction, commandName) {
  // vérifie bot + user + channel
}
```

### Comment ça marche

```
User tape /ban
        ↓
interactionCreate.js → checkPermissions(interaction, 'ban')
        ↓
1. Le BOT a BanMembers ? (rôle)
2. Le BOT a BanMembers DANS LE SALON ? (si channel)
3. L'USER a BanMembers ?
        ↓
✅ Tout OK → execute()
❌ Manque → message clair
```

### Les 2 couches

| Couche | Où | Rôle |
|--------|-----|------|
| **`setDefaultMemberPermissions`** | Dans chaque commande | **Cache** la commande aux non-modos |
| **`checkPermissions`** | `utils/permissions.js` | **Vérifie** bot + user + salon |

👉 **Les deux sont complémentaires** : l'un **cache** (UX), l'autre **vérifie** (sécurité).

---

## 🔐 Permissions du bot

### En test (simple)

👉 **Administrateur** sur le rôle du bot → tout fonctionne.

```
Paramètres → Rôles → BotTEST → Administrator ✅
```

### En production (recommandé)

| Permission | Pour |
|-----------|------|
| **Manage Channels** | `/slowmode` |
| **Manage Messages** | `/clear` |
| **Kick Members** | `/kick` |
| **Ban Members** | `/ban`, `/unban`, `/softban`, `/banlist` |
| **Moderate Members** | `/warn`, `/timeout`, `/untimeout`, `/clearwarns` |

⚠️ **Hiérarchie** : le rôle du bot doit être **au-dessus** des rôles des membres ciblés.

⚠️ **Salon** : pour `/slowmode`, `Manage Channel` doit être **Allow** dans le salon (pas `Deny`).

### Intents (portail développeur)

Active dans **discord.com/developers/applications → Bot → Privileged Gateway Intents** :
- ✅ **Server Members Intent** (pour `guildMemberAdd`)
- ✅ **Message Content Intent** (pour l'XP auto)

### URL d'invitation

```
https://discord.com/oauth2/authorize?client_id=TON_CLIENT_ID&scope=bot%20applications.commands&permissions=1099780313094
```

`1099780313094` = Manage Channels + Manage Messages + Kick + Ban + Moderate Members.

---

## 📤 Déploiement des commandes

```bash
# À lancer quand tu ajoutes/modifies une commande (data)
node deploy-commands.js

# Ou via npm
npm run deploy
```

👉 **Obligatoire** à chaque modification de `data` (nom, description, options).  
👉 **Pas nécessaire** si tu modifies seulement `execute` (logique).

---

## ▶️ Lancer le bot

```bash
# Développement (nodemon, rechargement auto)
npm run dev

# Production
npm start
```

### Scripts `package.json`

```json
"scripts": {
  "start":       "node index.js",
  "dev":         "nodemon index.js",
  "deploy":      "node deploy-commands.js",
  "db:migrate":  "prisma migrate dev",
  "db:deploy":   "prisma migrate deploy",
  "db:studio":   "prisma studio",
  "db:generate": "prisma generate"
}
```

---

## 🔧 Dépannage

### `TokenInvalid`
- Vérifier `TOKEN` dans `.env`
- **Reset Token** sur le portail développeur
- Pas de guillemets autour du token

### `prisma.guild is undefined`
- Vérifier que le **client Prisma est généré** : `npx prisma generate`
- Vérifier le **chemin d'import** (Prisma 7 : `src/generated/prisma`)
- Vérifier le `generator` dans `schema.prisma`

### `Missing Permissions` (50013)
- Vérifier les permissions du **rôle** du bot
- Vérifier les permissions **du salon** (un `Deny` bloque tout)
- Vérifier la **hiérarchie** des rôles

### `/rank` affiche 0
- Vérifier l'intent **MessageContent**
- Vérifier `events/messageCreate.js`
- Vérifier `queueXp` / `flush`
- Vérifier `prisma studio` → `guild_members.xp`

### `Command not found`
- Lancer `node deploy-commands.js`
- **Ctrl+R** dans Discord
- Vérifier `GUILD_ID` dans `.env`

### Tables non créées
```bash
npx prisma migrate status
npx prisma migrate dev --name init
npx prisma studio
```

### `/help` montre des commandes non autorisées
- Vérifier `utils/permissions.js` (`warns`, `banlist` avec `user: [ModerateMembers]`)
- Vérifier `setDefaultMemberPermissions` dans chaque commande

---

## 📝 Licence

ISC

---

## 🙏 Crédits

Développé avec ❤️ avec **discord.js** et **Prisma**.  
Inspiré des fonctionnalités de **MEE6**.