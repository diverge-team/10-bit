# 10-bit

Bot Discord pour le serveur Diverge.

## Fonctionnalites

- **Systeme XP** : Gagne de l'XP en envoyant des messages
- **Profil** : Consulte tes stats avec `/profile`
- **Roles colores** : Choisis ta couleur via reactions
- **Regles** : Systeme d'acceptation des regles du serveur
- **Role par defaut** : Attribution automatique aux nouveaux membres

## Stack

- Node.js 24
- discord.js 14
- Sequelize + MariaDB

## Installation

### Developpement local

```bash
# Installer les dependances
yarn install

# Configurer l'environnement
cp .env.example .env
# Editer .env avec tes tokens

# Initialiser la base de donnees
yarn db:init

# Deployer les slash commands
yarn deploy

# Lancer le bot
yarn start
```

### Production (Docker)

```bash
# Configurer l'environnement
cp .env.example .env
# Editer .env avec tes tokens

# Lancer avec Docker Compose
docker compose up -d

# Initialiser la DB (premiere fois)
docker compose exec bot node --require dotenv/config src/db-init.js

# Deployer les slash commands
docker compose exec bot node --require dotenv/config src/deploy-commands.js
```

## Structure

```
src/
├── index.js           # Point d'entree
├── database.js        # Configuration Sequelize
├── deploy-commands.js # Deploiement des slash commands
├── db-init.js         # Initialisation de la DB
├── commands/          # Slash commands
├── events/            # Event handlers Discord
└── models/            # Modeles Sequelize
```

## Scripts

| Commande | Description |
|----------|-------------|
| `yarn start` | Lance le bot |
| `yarn deploy` | Deploie les slash commands sur Discord |
| `yarn db:init` | Synchronise la base de donnees |
| `yarn db:reset` | Reset la base de donnees (perte de donnees) |

## Variables d'environnement

Voir `.env.example` pour la liste complete.
