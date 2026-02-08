const { Events, MessageFlags, EmbedBuilder } = require('discord.js');
const { QuizScore } = require('../database');

// Track who already answered each quiz (messageId -> Set of userIds)
const quizAnswers = new Map();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle button interactions (Isaac quiz)
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            const reply = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    },
};

/**
 * Handles button interactions for quizzes
 */
async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;

    // Isaac quiz buttons: isaac_quiz_{selectedIndex}_{correctIndex}
    if (customId.startsWith('isaac_quiz_')) {
        await handleIsaacQuizAnswer(interaction);
    }
}

/**
 * Handles Isaac quiz answer
 */
async function handleIsaacQuizAnswer(interaction) {
    try {
        const parts = interaction.customId.split('_');
        const selectedIndex = parseInt(parts[2], 10);
        const correctIndex = parseInt(parts[3], 10);
        const isCorrect = selectedIndex === correctIndex;

        const userId = interaction.user.id;
        const messageId = interaction.message.id;
        const username = interaction.user.displayName || interaction.user.username;

        // Check if user already answered this quiz
        if (!quizAnswers.has(messageId)) {
            quizAnswers.set(messageId, new Map());
        }
        const messageAnswers = quizAnswers.get(messageId);

        if (messageAnswers.has(userId)) {
            const correctButton = interaction.message.components[0].components[correctIndex];
            const correctAnswer = correctButton.label;

            await interaction.reply({
                content: `⚠️ Tu as déjà répondu à ce quiz !\n\n💡 La bonne réponse est : **${correctAnswer}**`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Record this answer
        messageAnswers.set(userId, { username, isCorrect });

        // Update score in database
        const [score] = await QuizScore.findOrCreate({
            where: { user_id: userId, game: 'isaac' },
            defaults: { correct_answers: 0, total_answers: 0 },
        });

        score.total_answers += 1;
        if (isCorrect) {
            score.correct_answers += 1;
        }
        await score.save();

        // Calculate percentage
        const percentage = Math.round((score.correct_answers / score.total_answers) * 100);

        // Update the embed with the list of answers
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(originalEmbed);

        // Build the answers list
        const answersArray = Array.from(messageAnswers.values());
        const answersList = answersArray
            .map((answer, index) => {
                const emoji = answer.isCorrect ? '✅' : '❌';
                return `${index + 1}. ${answer.username} ${emoji}`;
            })
            .join('\n');

        // Update or add the "Réponses" field
        const existingFields = originalEmbed.fields.filter(f => f.name !== '👥 Réponses');
        updatedEmbed.setFields([
            ...existingFields,
            { name: '👥 Réponses', value: answersList || 'Aucune réponse', inline: false },
        ]);

        // Update the message
        await interaction.message.edit({ embeds: [updatedEmbed] });

        // Send ephemeral response to the user
        if (isCorrect) {
            await interaction.reply({
                content: `✅ **Bonne réponse !**\n📊 Ton score Isaac : ${score.correct_answers}/${score.total_answers} (${percentage}%)`,
                flags: MessageFlags.Ephemeral,
            });
        } else {
            const correctButton = interaction.message.components[0].components[correctIndex];
            const correctAnswer = correctButton.label;

            await interaction.reply({
                content: `❌ **Mauvaise réponse !**\nLa bonne réponse était : **${correctAnswer}**\n📊 Ton score Isaac : ${score.correct_answers}/${score.total_answers} (${percentage}%)`,
                flags: MessageFlags.Ephemeral,
            });
        }
    } catch (error) {
        console.error('Error handling Isaac quiz answer:', error);
        await interaction.reply({
            content: '❌ Une erreur est survenue.',
            flags: MessageFlags.Ephemeral,
        });
    }
}
