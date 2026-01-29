const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Ticket } = require('../database');

const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID || '1466454158390595649';
const SUPPORT_USER_ID = process.env.SUPPORT_USER_ID || '102132002664222720';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('incident')
        .setDescription('Déposer un ticket support auprès du service informatique')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Décris ton problème technique')
                .setRequired(true)),
    async execute(interaction) {
        const description = interaction.options.getString('description');

        // Create ticket in database
        const ticket = await Ticket.create({
            user_id: interaction.user.id,
            description: description,
            status: 'open',
        });

        // Format ticket number with leading zeros
        const ticketNumber = `#${String(ticket.ticket_number).padStart(4, '0')}`;

        // Create embed for the ticket
        const embed = new EmbedBuilder()
            .setTitle(`🎫 Nouveau ticket ${ticketNumber}`)
            .setColor(0xFF6B6B) // Red/orange for urgency
            .addFields(
                { name: '👤 Demandeur', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                { name: '📊 Statut', value: '⏳ En attente', inline: true },
                { name: '📝 Description', value: description, inline: false }
            )
            .setFooter({ text: `Ticket ${ticketNumber}` })
            .setTimestamp();

        // Send to support channel
        try {
            const supportChannel = await interaction.client.channels.fetch(SUPPORT_CHANNEL_ID);
            await supportChannel.send({
                content: `Bonjour <@${SUPPORT_USER_ID}>, <@${interaction.user.id}> a déposé un nouveau ticket support !`,
                embeds: [embed],
            });

            // Confirm to user
            await interaction.reply({
                content: `✅ Ton ticket ${ticketNumber} a été créé avec succès ! Le service informatique va s'en occuper. (Ou pas 😏)`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error sending ticket to support channel:', error);
            await interaction.reply({
                content: '❌ Erreur lors de la création du ticket. Le service informatique est probablement en pause café.',
                ephemeral: true,
            });
        }
    },
};
