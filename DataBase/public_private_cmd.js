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

// Définition du modèle RelCmd (anciennement OvlCmd)
const RelCmd = sequelize.define(
  "RelCmd",
  {
    nom_cmd: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "public_private_cmds",
    timestamps: false
  }
);

// Synchronisation automatique
(async () => {
  await RelCmd.sync();
  console.log("public_private_cmds synchronisée.");
})();

// Ajouter ou mettre à jour une commande
async function set_cmd(nom_cmd, type = "public") {
  if (!nom_cmd || !type) throw new Error("Données manquantes");

  await RelCmd.upsert({
    nom_cmd,
    type
  });
}

// Supprimer une commande
async function del_cmd(nom_cmd, type) {
  return await RelCmd.destroy({
    where: { nom_cmd, type }
  });
}

// Lister toutes les commandes d'un type
async function list_cmd(type) {
  return await RelCmd.findAll({
    where: { type }
  });
}

// Récupérer une commande spécifique
async function get_cmd(nom_cmd, type) {
  return await RelCmd.findOne({
    where: { nom_cmd, type }
  });
}

module.exports = {
  set_cmd,
  del_cmd,
  list_cmd,
  get_cmd
};
