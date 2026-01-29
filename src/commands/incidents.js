const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Ticket } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('incidents')
        .setDescription('Afficher la liste des tickets support')
        .addStringOption(option =>
            option.setName('statut')
                .setDescription('Filtrer par statut')
                .addChoices(
                    { name: 'Tous', value: 'all' },
                    { name: 'Ouverts', value: 'open' },
                    { name: 'Fermés', value: 'closed' }
                )),
    async execute(interaction) {
        const statusFilter = interaction.options.getString('statut') || 'all';

        // Build query
        const whereClause = statusFilter === 'all' ? {} : { status: statusFilter };

        // Fetch tickets
        const tickets = await Ticket.findAll({
            where: whereClause,
            order: [['ticket_number', 'DESC']],
            limit: 10,
        });

        if (tickets.length === 0) {
            await interaction.reply({
                content: '📋 Aucun ticket trouvé.',
                ephemeral: true,
            });
            return;
        }

        // Format ticket list
        const ticketList = tickets.map(ticket => {
            const ticketNumber = `#${String(ticket.ticket_number).padStart(4, '0')}`;
            const statusEmoji = ticket.status === 'open' ? '⏳' : '✅';
            const satisfactionEmoji = ticket.satisfaction === true ? ' 👍' : ticket.satisfaction === false ? ' 👎' : '';
            const description = ticket.description.length > 50
                ? ticket.description.substring(0, 50) + '...'
                : ticket.description;
            return `${statusEmoji} **${ticketNumber}** - <@${ticket.user_id}> - ${description}${satisfactionEmoji}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('📋 Liste des tickets support')
            .setDescription(ticketList)
            .setColor(statusFilter === 'open' ? 0xFF6B6B : statusFilter === 'closed' ? 0x51CF66 : 0x5865F2)
            .setFooter({ text: `Affichage des ${tickets.length} derniers tickets` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
