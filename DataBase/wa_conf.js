const { Sequelize, DataTypes } = require('sequelize');
const config = require("../set");

const db = config.DATABASE;

let sequelize;

// Configuration de la base de données selon le type
if (!db) {
  // SQLite par défaut
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db",
    logging: false
  });
} else {
  // PostgreSQL si DB configurée
  sequelize = new Sequelize(db, {
    dialect: 'postgres',
    ssl: true,
    protocol: "postgres",
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

// Définition du modèle WA_CONF
const WA_CONF = sequelize.define("WA_CONF", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  presence: {
    type: DataTypes.STRING,
    defaultValue: "rien"
  },
  lecture_status: {
    type: DataTypes.STRING,
    defaultValue: "non"
  },
  like_status: {
    type: DataTypes.STRING,
    defaultValue: "non"
  },
  dl_status: {
    type: DataTypes.STRING,
    defaultValue: "non"
  },
  antivv: {
    type: DataTypes.STRING,
    defaultValue: "non"
  },
  antidelete: {
    type: DataTypes.STRING,
    defaultValue: "non"
  },
  mention: {
    type: DataTypes.STRING,
    defaultValue: "non"
  }
}, {
  tableName: "wa_conf",
  timestamps: false
});

// Synchronisation automatique du modèle
(async () => {
  await WA_CONF.sync();
  console.log("WA_CONF synchronisée.");
})();

module.exports = { WA_CONF };
