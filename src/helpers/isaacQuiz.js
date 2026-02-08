const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { items, characters, bosses } = require('../data/isaacData');

/**
 * Picks a random element from an array
 */
function pickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffles an array in place
 */
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Gets random wrong answers from a list, excluding the correct one
 */
function getWrongAnswers(list, correct, count, getAnswer) {
	const wrong = list.filter(item => getAnswer(item) !== getAnswer(correct));
	const shuffled = shuffle([...wrong]);
	return shuffled.slice(0, count).map(getAnswer);
}

/**
 * Question types generators
 */
const questionTypes = [
	// Item -> Effect
	{
		weight: 3,
		generate: () => {
			const item = pickRandom(items);
			const wrongEffects = getWrongAnswers(items, item, 2, i => i.effect);
			const answers = shuffle([item.effect, ...wrongEffects]);

			return {
				question: `Que fait l'item **${item.name}** ?`,
				answers,
				correctIndex: answers.indexOf(item.effect),
				difficulty: item.difficulty,
				category: 'item',
			};
		},
	},
	// Effect -> Item
	{
		weight: 2,
		generate: () => {
			const item = pickRandom(items);
			const wrongItems = getWrongAnswers(items, item, 2, i => i.name);
			const answers = shuffle([item.name, ...wrongItems]);

			return {
				question: `Quel item a cet effet : *"${item.effect}"* ?`,
				answers,
				correctIndex: answers.indexOf(item.name),
				difficulty: item.difficulty,
				category: 'item',
			};
		},
	},
	// Item -> Pool
	{
		weight: 2,
		generate: () => {
			const item = pickRandom(items);
			const pools = ['Treasure Room', 'Shop', 'Devil Room', 'Angel Room', 'Boss Room', 'Secret Room'];
			const wrongPools = pools.filter(p => p !== item.pool).slice(0, 2);
			const answers = shuffle([item.pool, ...wrongPools]);

			return {
				question: `Dans quel pool trouve-t-on **${item.name}** ?`,
				answers,
				correctIndex: answers.indexOf(item.pool),
				difficulty: item.difficulty,
				category: 'item',
			};
		},
	},
	// Character -> Starting item
	{
		weight: 2,
		generate: () => {
			const char = pickRandom(characters);
			const wrongItems = getWrongAnswers(characters, char, 2, c => c.startingItem);
			const answers = shuffle([char.startingItem, ...wrongItems]);

			return {
				question: `Avec quel item/capacité commence **${char.name}** ?`,
				answers,
				correctIndex: answers.indexOf(char.startingItem),
				difficulty: char.difficulty,
				category: 'character',
			};
		},
	},
	// Character -> Health
	{
		weight: 1,
		generate: () => {
			const charsWithHearts = characters.filter(c =>
				c.redHearts > 0 || c.soulHearts > 0 || c.blackHearts > 0,
			);
			const char = pickRandom(charsWithHearts);

			let healthType, healthValue;
			if (char.blackHearts > 0) {
				healthType = 'coeurs noirs';
				healthValue = char.blackHearts;
			} else if (char.soulHearts > 0) {
				healthType = 'coeurs d\'âme';
				healthValue = char.soulHearts;
			} else {
				healthType = 'coeurs rouges';
				healthValue = char.redHearts;
			}

			const wrongValues = [1, 2, 3, 4, 5].filter(v => v !== healthValue).slice(0, 2);
			const answers = shuffle([`${healthValue}`, ...wrongValues.map(String)]);

			return {
				question: `Combien de ${healthType} a **${char.name}** au départ ?`,
				answers,
				correctIndex: answers.indexOf(String(healthValue)),
				difficulty: char.difficulty,
				category: 'character',
			};
		},
	},
	// Boss -> Floor
	{
		weight: 2,
		generate: () => {
			const boss = pickRandom(bosses);
			const wrongFloors = getWrongAnswers(bosses, boss, 2, b => b.floor);
			const answers = shuffle([boss.floor, ...wrongFloors]);

			return {
				question: `Où affronte-t-on **${boss.name}** ?`,
				answers,
				correctIndex: answers.indexOf(boss.floor),
				difficulty: boss.difficulty,
				category: 'boss',
			};
		},
	},
];

/**
 * Generates a random quiz question
 * @returns {{question: string, answers: string[], correctIndex: number, difficulty: string, category: string}}
 */
function generateQuiz() {
	// Weight-based random selection
	const totalWeight = questionTypes.reduce((sum, qt) => sum + qt.weight, 0);
	let random = Math.random() * totalWeight;

	for (const qt of questionTypes) {
		random -= qt.weight;
		if (random <= 0) {
			return qt.generate();
		}
	}

	// Fallback
	return questionTypes[0].generate();
}

/**
 * Creates the Discord embed and buttons for a quiz
 * @param {object} quiz - The quiz object from generateQuiz()
 * @returns {{embed: EmbedBuilder, row: ActionRowBuilder, correctIndex: number}}
 */
function createQuizMessage(quiz) {
	const difficultyEmoji = quiz.difficulty === 'easy' ? '🟢' : '🔴';
	const categoryEmoji = {
		item: '📦',
		character: '👤',
		boss: '👹',
	}[quiz.category] || '❓';

	const embed = new EmbedBuilder()
		.setTitle('🎮 Quiz Isaac du jour !')
		.setDescription(quiz.question)
		.setColor(quiz.difficulty === 'easy' ? 0x00FF00 : 0xFF0000)
		.addFields({
			name: 'Infos',
			value: `${categoryEmoji} ${quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)} | ${difficultyEmoji} ${quiz.difficulty === 'easy' ? 'Facile' : 'Difficile'}`,
		})
		.setFooter({ text: 'Clique sur la bonne réponse !' })
		.setTimestamp();

	const buttons = quiz.answers.map((answer, index) => {
		return new ButtonBuilder()
			.setCustomId(`isaac_quiz_${index}_${quiz.correctIndex}`)
			.setLabel(answer.length > 80 ? answer.substring(0, 77) + '...' : answer)
			.setStyle(ButtonStyle.Primary);
	});

	const row = new ActionRowBuilder().addComponents(buttons);

	return { embed, row, correctIndex: quiz.correctIndex };
}

module.exports = {
	generateQuiz,
	createQuizMessage,
};
