const { Sequelize, DataTypes } = require("sequelize");

// Connexion à la base PostgreSQL
const sequelize = new Sequelize(
  "postgresql://postgres.mkvywsrvpbngcaabihlb:database@passWord1@aws-0-eu-north-1.pooler.supabase.com:6543/postgres",
  {
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
  }
);

// Définition du modèle Session
const Session = sequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: "sessions",
    timestamps: false
  }
);

// Synchronisation automatique
(async () => {
  await Session.sync();
  console.log("Session synchronisée.");
})();

// Récupérer une session et mettre à jour la date de création
async function get_session(id) {
  const session = await Session.findByPk(id);
  if (!session) return null;

  session.createdAt = new Date();
  await session.save();

  return session.content;
}

module.exports = get_session;
