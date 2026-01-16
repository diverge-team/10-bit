const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Settings } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Publie les regles sur le serveur.')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const rulesEmbeds = [
            new EmbedBuilder()
                .setTitle(':wave: Bienvenue sur le serveur Diverge !')
                .setDescription(
                    'Serveur de [DRV] Diverge, communaute de joueur-euses et d\'ami-es d\'Ori / fnev.eu. ' +
                    'Pour acceder aux differents salons du Discord, tu dois lire et accepter l\'ensemble des regles ci-dessous.'
                ),
            new EmbedBuilder()
                .setTitle(':one: Discrimination')
                .setDescription(
                    '**Aucune discrimination envers un-e utilisateur-ice ou une communaute ne sera toleree.**\n' +
                    'Cela inclut l\'un des elements suivants :\n' +
                    '\u25AA Avoir recour a un discours incitant a la haine ;\n' +
                    '\u25AA Etre discriminatoire en ce qui concerne l\'origine ethnique ou nationale, ' +
                    'l\'appartenance religieuse, l\'orientation sexuelle, le sexe, l\'identite de genre, ' +
                    'la maladie ou le handicap.'
                ),
            new EmbedBuilder()
                .setTitle(':two: Trolling, bully'),
            new EmbedBuilder()
                .setTitle(':three: Spam'),
            new EmbedBuilder()
                .setTitle(':four: Informations personnelles ou sensibles')
                .setDescription(
                    '**Ne partage pas de donnees personnelles ou sensibles.**\n' +
                    'Cela inclut :\n' +
                    '\u25AA Toute information qui permet de t\'identifier, comme ton nom complet, ' +
                    'ton e-mail, ton adresse, numero de telephone, etc.\n' +
                    '\u25AA Ces memes donnees d\'une autre personne, qu\'elle soit presente sur le serveur ou non.'
                ),
            new EmbedBuilder()
                .setTitle(':five: Autres informations')
                .setDescription(
                    'Quelques informations supplementaires s\'ajoutant aux regles ci-dessus.\n\n' +
                    '**:pushpin: Regles specifiques**\n' +
                    'Certains salons ont ou pourront avoir des regles additionnelles. ' +
                    'Pense a verifier les messages epingles en cliquant sur la punaise dans chaque salon avant de poster.\n\n' +
                    '**:recycle: Changements des regles**\n' +
                    `Les regles sont susceptibles d'evoluer au fil du temps. Une annonce sera faite dans <#${process.env.ANNOUNCEMENTS_CHANNEL_ID}> si cela se produit.\n\n` +
                    '**:ticket: Roles**\n' +
                    `Differents roles te sont disponibles, que ce soit pour te debloquer l'acces a certains salons, ou pour personnaliser ton profil. Ces roles sont acquerables dans le salon <#${process.env.ROLES_CHANNEL_ID}>, en reagissant aux differents messages de notre bien aime bot <@${process.env.CLIENT_ID}>.\n\n` +
                    '**Pour approuver ces regles, clique sur la reaction ci-dessous. Nous te souhaitons de bons moments parmi nous !**'
                ),
        ];

        const rulesMessageSettings = await Settings.findOne({ where: { name: 'rules_message_id' } });
        const rulesChannel = await interaction.client.channels.fetch(interaction.guild.rulesChannelId);

        if (rulesMessageSettings) {
            const message = await rulesChannel.messages.fetch(rulesMessageSettings.value);
            const announcementsChannel = await interaction.client.channels.fetch(process.env.ANNOUNCEMENTS_CHANNEL_ID);

            await message.edit({ embeds: rulesEmbeds });
            await announcementsChannel.send(
                '**:bookmark_tabs: Regles**\n\n' +
                `Une nouvelle version des <#${interaction.guild.rulesChannelId}> vient d'etre publiee, n'hesitez pas a en prendre connaissance, merci ! :nerd:`
            );

            const url = `https://discord.com/channels/${process.env.GUILD_ID}/${rulesChannel.id}/${message.id}`;
            await interaction.reply({ content: `Regles editees: ${url}`, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const message = await rulesChannel.send({ embeds: rulesEmbeds });
            await message.react(process.env.CHECK_EMOJI);

            await Settings.create({
                name: 'rules_message_id',
                value: message.id,
            });

            const url = `https://discord.com/channels/${process.env.GUILD_ID}/${rulesChannel.id}/${message.id}`;
            await interaction.editReply(`Regles publiees: ${url}`);
        }
    },
};
