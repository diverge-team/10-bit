module.exports = (sequelize, DataTypes) => {
	return sequelize.define('QuizScore', {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		game: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'isaac',
		},
		correct_answers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		total_answers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	}, {
		indexes: [
			{
				unique: true,
				fields: ['user_id', 'game'],
			},
		],
	});
};
