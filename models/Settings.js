module.exports = (sequelize, DataTypes) => {
    return sequelize.define('settings', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });
};
