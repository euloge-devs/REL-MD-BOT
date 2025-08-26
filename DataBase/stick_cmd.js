const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
const db = config.DATABASE;

let sequelize;
if (!db) {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.db",
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

// Modèle StickCmd
const StickCmd = sequelize.define("StickCmd", {
  no_cmd: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  stick_url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: "stickcmd",
  timestamps: false
});

// Synchronisation
(async () => {
  await StickCmd.sync();
  console.log("StickCmd synchronisée.");
})();

// Ajouter ou modifier une commande sticker
async function set_stick_cmd(command, url) {
  if (!command || !url) throw new Error("Commande ou URL manquante");
  await StickCmd.upsert({ no_cmd: command, stick_url: url });
  return true;
}

// Supprimer une commande sticker
async function del_stick_cmd(command) {
  if (!command) throw new Error("Commande manquante");
  const deleted = await StickCmd.destroy({ where: { no_cmd: command } });
  return deleted > 0;
}

// Récupérer toutes les commandes sticker
async function get_stick_cmd() {
  const allCmds = await StickCmd.findAll();
  return allCmds.map(({ no_cmd, stick_url }) => ({ no_cmd, stick_url }));
}

module.exports = {
  set_stick_cmd,
  del_stick_cmd,
  get_stick_cmd
};
