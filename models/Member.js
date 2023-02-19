module.exports = (sequelize, DataTypes) => {
    return sequelize.define('members', {
        user_id: {
            type: DataTypes.STRING,
            unique: true,
            length: 180,
            allowNull: false
        },
        xp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 0,
        },
        nb_messages: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 0,
            name: 'nb_messages',
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
};
