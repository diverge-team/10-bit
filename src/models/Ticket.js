module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tickets', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ticket_number: {
            type: DataTypes.INTEGER,
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
        hooks: {
            beforeValidate: async (ticket) => {
                if (!ticket.ticket_number) {
                    const maxTicket = await sequelize.models.tickets.findOne({
                        order: [['ticket_number', 'DESC']],
                    });
                    ticket.ticket_number = maxTicket ? maxTicket.ticket_number + 1 : 1;
                }
            },
        },
    });
};
