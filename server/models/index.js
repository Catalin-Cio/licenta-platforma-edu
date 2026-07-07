const sequelize = require('../database');
const User = require('./User');
const Resource = require('./Resource');
const Purchase = require('./Purchase');
const Session = require('./Session');
const Enrollment = require('./Enrollment');
const Notification = require('./Notification');

User.hasMany(Resource, { foreignKey: 'userId', onDelete: 'CASCADE' });
Resource.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Purchase, { foreignKey: 'userId', onDelete: 'CASCADE' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

Resource.hasMany(Purchase, { foreignKey: 'resourceId', onDelete: 'CASCADE' });
Purchase.belongsTo(Resource, { foreignKey: 'resourceId' });

User.hasMany(Session, { foreignKey: 'hostId', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

User.hasMany(Enrollment, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { foreignKey: 'studentId' });

Session.hasMany(Enrollment, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Enrollment.belongsTo(Session, { foreignKey: 'sessionId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Resource,
    Purchase,
    Session,
    Enrollment,
    Notification
};