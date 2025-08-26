const { Sequelize, DataTypes } = require('sequelize');
const config = require("../set");
const db = config.DATABASE;

let sequelize;
if (!db) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: './database.db',
    logging: false
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
}

// Table des paramètres des groupes
const relGroupSettings = sequelize.define("RelGroupSettings", {
  id: { type: DataTypes.STRING, primaryKey: true },
  welcome: { type: DataTypes.STRING, defaultValue: "non" },
  goodbye: { type: DataTypes.STRING, defaultValue: "non" },
  antipromote: { type: DataTypes.STRING, defaultValue: "non" },
  antidemote: { type: DataTypes.STRING, defaultValue: "non" }
}, {
  tableName: "group_settings",
  timestamps: false
});

// Table des événements des groupes
const relEvents = sequelize.define("RelEvents", {
  id: { type: DataTypes.STRING, primaryKey: true },
  welcome_msg: { type: DataTypes.TEXT, allowNull: true },
  goodbye_msg: { type: DataTypes.TEXT, allowNull: true },
  promoteAlert: { type: DataTypes.TEXT, defaultValue: "non" },
  demoteAlert: { type: DataTypes.TEXT, defaultValue: "non" }
}, {
  tableName: "events2",
  timestamps: false
});

(async () => {
  await GroupSettings.sync();
  await lEvents.sync();
  console.log("GroupSettings et Events synchronisées.");
})();

module.exports = {
  GroupSettings,
  Events
};
