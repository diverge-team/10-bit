module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tickets', {
        ticket_number: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('open', 'closed'),
            allowNull: false,
            defaultValue: 'open',
        },
        satisfaction: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: null,
        },
        resolution_message_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });
};
