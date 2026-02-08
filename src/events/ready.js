const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { getNicholasTraveler, getNicholasSandford } = require('../helpers/nicholasScraper');

const STATUSES = [
    'Pourquoi ? Pour feur.',
    'Je vous observe.',
    '1 message sur 50...',
    'Moi je m\'appelle 10-bit',
    'quoi',
    'Verge.',
    '10 bits ça fait beaucoup',
    'beep boop',
];

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function rotateStatus(client) {
    const status = pickRandom(STATUSES);
    client.user.setActivity(status, { type: ActivityType.Custom });
}

/**
 * Posts Nicholas the Traveler update
 */
async function postNicholasTraveler(client) {
    try {
        const channelId = process.env.NICHOLAS_CHANNEL_ID;
        if (!channelId) {
            console.log('NICHOLAS_CHANNEL_ID not configured, skipping Nicholas the Traveler post');
            return;
        }

        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('Nicholas channel not found');
            return;
        }

        const data = await getNicholasTraveler();

        // Build clickable links
        const locationValue = data.mapUrl
            ? `[${data.location}](${data.mapUrl})`
            : data.location;
        const itemValue = data.itemUrl
            ? `[${data.item}](${data.itemUrl})`
            : data.item;

        const embed = new EmbedBuilder()
            .setTitle('🧳 Nicholas le Voyageur')
            .setColor(0x00AE86)
            .addFields(
                { name: '📍 Localisation', value: locationValue, inline: true },
                { name: '📦 Objet demandé', value: itemValue, inline: true },
                { name: '🔢 Quantité', value: `${data.quantity} par cadeau`, inline: true },
            )
            .setFooter({ text: 'Mise à jour hebdomadaire - Tous les lundis à 15:00 UTC' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log('Posted Nicholas the Traveler update');
    } catch (error) {
        console.error('Error posting Nicholas the Traveler update:', error);
    }
}

/**
 * Posts Nicholas Sandford update
 */
async function postNicholasSandford(client) {
    try {
        const channelId = process.env.NICHOLAS_CHANNEL_ID;
        if (!channelId) {
            console.log('NICHOLAS_CHANNEL_ID not configured, skipping Nicholas Sandford post');
            return;
        }

        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('Nicholas channel not found');
            return;
        }

        const data = await getNicholasSandford();

        // Build clickable link for item
        const itemValue = data.itemUrl
            ? `[${data.item}](${data.itemUrl})`
            : data.item;

        const embed = new EmbedBuilder()
            .setTitle('🏹 Nicholas Sandford')
            .setColor(0xFF6B35)
            .addFields(
                { name: '📦 Objet demandé', value: itemValue, inline: true },
                { name: '🔢 Quantité', value: `${data.quantity} objets`, inline: true },
            )
            .setFooter({ text: 'Mise à jour quotidienne - Tous les jours à 07:00 UTC' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        console.log('Posted Nicholas Sandford update');
    } catch (error) {
        console.error('Error posting Nicholas Sandford update:', error);
    }
}

/**
 * Setup cron jobs for Nicholas posts
 */
function setupNicholasCronJobs(client) {
    // Nicholas the Traveler: Every Monday at 15:05 UTC
    cron.schedule('5 15 * * 1', () => {
        console.log('Running Nicholas the Traveler cron job');
        postNicholasTraveler(client);
    }, {
        timezone: 'UTC',
    });

    // Nicholas Sandford: Every day at 07:05 UTC
    cron.schedule('5 7 * * *', () => {
        console.log('Running Nicholas Sandford cron job');
        postNicholasSandford(client);
    }, {
        timezone: 'UTC',
    });

    console.log('Nicholas cron jobs scheduled');
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        rotateStatus(client);
        setInterval(() => rotateStatus(client), 5 * 60 * 1000); // toutes les 5 min

        // Setup Nicholas auto-posting
        setupNicholasCronJobs(client);
    },
};
