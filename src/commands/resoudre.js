const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Ticket } = require('../database');

const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID || '1466454158390595649';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resoudre')
        .setDescription('Marquer un ticket comme résolu')
        .addIntegerOption(option =>
            option.setName('numero')
                .setDescription('Numéro du ticket à résoudre')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('commentaire')
                .setDescription('Commentaire de résolution (optionnel)')
                .setRequired(false)),
    async execute(interaction) {
        const ticketNumber = interaction.options.getInteger('numero');
        const comment = interaction.options.getString('commentaire');

        // Find ticket
        const ticket = await Ticket.findOne({
            where: { ticket_number: ticketNumber },
        });

        if (!ticket) {
            await interaction.reply({
                content: `❌ Le ticket #${String(ticketNumber).padStart(4, '0')} n'existe pas.`,
                ephemeral: true,
            });
            return;
        }

        if (ticket.status === 'closed') {
            await interaction.reply({
                content: `⚠️ Le ticket #${String(ticketNumber).padStart(4, '0')} est déjà fermé.`,
                ephemeral: true,
            });
            return;
        }

        // Update ticket status
        ticket.status = 'closed';
        await ticket.save();

        const ticketNumberFormatted = `#${String(ticketNumber).padStart(4, '0')}`;

        // Create resolution embed
        const embed = new EmbedBuilder()
            .setTitle(`✅ Ticket ${ticketNumberFormatted} résolu`)
            .setColor(0x51CF66) // Green
            .addFields(
                { name: '👤 Demandeur', value: `<@${ticket.user_id}>`, inline: true },
                { name: '🛠️ Résolu par', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📅 Date de résolution', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                { name: '📝 Problème initial', value: ticket.description, inline: false }
            )
            .setFooter({ text: `Ticket ${ticketNumberFormatted}` })
            .setTimestamp();

        if (comment) {
            embed.addFields({ name: '💬 Commentaire', value: comment, inline: false });
        }

        // Add satisfaction question field
        embed.addFields({
            name: '⭐ Satisfaction',
            value: '<@' + ticket.user_id + '>, es-tu satisfait du traitement de ton ticket ? Réagis avec 👍 ou 👎',
            inline: false,
        });

        // Send to support channel
        try {
            const supportChannel = await interaction.client.channels.fetch(SUPPORT_CHANNEL_ID);
            const resolutionMessage = await supportChannel.send({
                content: `<@${ticket.user_id}> Bonne nouvelle ! Ton ticket a été résolu ! 🎉`,
                embeds: [embed],
            });

            // Add reactions for satisfaction feedback
            await resolutionMessage.react('👍');
            await resolutionMessage.react('👎');

            // Store message ID in ticket for later reference
            ticket.resolution_message_id = resolutionMessage.id;
            await ticket.save();

            // Confirm to resolver
            await interaction.reply({
                content: `✅ Le ticket ${ticketNumberFormatted} a été marqué comme résolu.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error sending resolution to support channel:', error);
            await interaction.reply({
                content: '❌ Erreur lors de la publication de la résolution.',
                ephemeral: true,
            });
        }
    },
};
