const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Settings } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Publie les règles sur le serveur.')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const rulesEmbeds = [
            new EmbedBuilder()
                .setTitle(':wave: Bienvenue sur le serveur Diverge !')
                .setDescription('Pour accéder aux différents salons du Discord, tu dois lire et accepter l\'ensemble des règles ci-dessous.')
            ,
            new EmbedBuilder()
                .setTitle(':one: Discrimination')
                .setDescription(
                    '**Aucune discrimination envers un·e utilisateur·ice ou une communauté ne sera tolérée.**\r\n' +
                    'Cela inclut l\'un des éléments suivants :\r\n' +
                    '\uFFED Avoir recour à un discour incitant à la haine ;\r\n' +
                    '\uFFED Être discriminatoire en ce qui concerne l\'origine ethnique ou nationale, l\'appartenance religieuse, l\'orientation sexuelle, le sexe, l\'identité de genre, la maladie ou le handicap.\r\n'
                )
            ,
            new EmbedBuilder()
                .setTitle(':two: Trolling, bully')
            ,
            new EmbedBuilder()
                .setTitle(':three: Spam')
            ,
            new EmbedBuilder()
                .setTitle(':four: Informations personnelles ou sensibles')
                .setDescription(
                    '**Ne partage pas de données personnelles ou sensible.**\r\n' +
                    'Cela inclut :\r\n' +
                    '\uFFED Toute information qui permet de t\'identifier, comme ton nom complet, ton e-mail, ton adresse, numéro de téléphone, etc.\r\n' +
                    '\uFFED Ces mêmes données d\'une autre personne, qu\'elle soit présente sur le serveur ou non.'
                )
            ,
            new EmbedBuilder()
                .setTitle(':five: Autres informations')
                .setDescription(
                    'Quelques informations supplémentaires s\'ajoutant aux règles ci-dessus.\r\n\r\n' +
                    '**:pushpin: Règles spécifiques**\r\n' +
                    'Certains salons ont ou pourront avoir des règles additionnelles. Pense à vérifier les messages épinglés en cliquant sur la punaise dans chaque salon avant de poster.\r\n\r\n' +
                    '**:recycle: Changements des règles**\r\n' +
                    'Les règles sont susceptibles d\'évoluer au fil du temps. Une annonce sera faite dans <#' + process.env.ANNOUNCEMENTS_CHANNEL_ID + '> si cela se produit.\r\n\r\n' +
                    '**:ticket: Rôles**\r\n' +
                    'Différents rôles te sont disponibles, que ce soit pour te débloquer l\'accès à certains salons, ou pour personnaliser ton profil. Ces rôles sont acquérables dans le salon <#1066148717331218472>, en réagissant aux différents messages de notre bien aimé bot <@1064677183626424330>.\r\n' +
                    '\r\n' +
                    '**Pour approuver ces règles, clique sur la réaction ci-dessous. Nous te souhaitons de bons moments parmi nous !**'
                )
            ,
        ];

        let settings = await Settings.findOne({where: {name: 'rules_message_id'}});

        if (settings) {
            const message = await interaction.client.channels.cache.get(interaction.guild.rulesChannelId).messages.fetch(settings.value);


            await message.edit({embeds: rulesEmbeds})
                .then(await interaction.client.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID).send(
                    '**:bookmark_tabs: Règles**\r\n\r\n' +
                    'Une nouvelle version des <#' + interaction.guild.rulesChannelId + '> vient d\'être publiée, n\'hésitez pas à en prendre connaissance, merci ! :nerd:'
                ))
                .then(await interaction.reply('Règles éditées : <https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + '>.'))
            ;
        } else {
            const message = await interaction.client.channels.cache.get(interaction.guild.rulesChannelId).send({
                embeds: rulesEmbeds,
            });

            settings = await Settings.create({
                name: 'rules_message_id',
                value: message.id,
            })
                .then(message.react(process.env.CHECK_EMOJI))
                .then(interaction.reply('Règles publiées : <https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + '>.'))
            ;
        }
    },
};
