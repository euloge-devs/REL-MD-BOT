const { Sequelize, DataTypes } = require("sequelize");
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
    dialect: "postgres",
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

const RelPlugin = sequelize.define("RelPlugin", {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "plugin",
  timestamps: false
});

(async () => {
  await RelPlugin.sync();
  console.log("RelPlugin synchronisée.");
})();

module.exports = {
  RelPlugin
};
