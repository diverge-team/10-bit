module.exports = (sequelize, DataTypes) => {
    return sequelize.define('members', {
        user_id: {
            type: DataTypes.STRING,
            unique: true,
        },
        xp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        nbMessages: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        birthday: {
            type: DataTypes.DATE,
        },
    });
};
