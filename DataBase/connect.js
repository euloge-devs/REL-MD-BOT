const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
const get_session = require('./session');

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
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  });
}

// Modèle relConnect
const relConnect = sequelize.define('relConnect', {
  numero: { type: DataTypes.STRING, primaryKey: true },
  session_id: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "connect",
  timestamps: false
});

(async () => {
  await relConnect.sync();
  console.log("relConnect synchronisée.");
})();

// Fonctions liées aux sessions secondaires rel
async function relSaveSession(sessionId) {
  let sessionData = await get_session(sessionId);
  if (!sessionData) {
    console.error("❌ Session invalide pour l’ID :", sessionId);
    return false;
  }

  try {
    sessionData = typeof sessionData === "string" ? JSON.parse(sessionData) : sessionData;
  } catch (err) {
    console.error("❌ Erreur parsing JSON :", err.message);
    return false;
  }

  if (!sessionData?.me?.id) {
    console.error("❌ Numéro introuvable dans les creds");
    return false;
  }

  const numero = sessionData.me.id.split(':')[0];
  try {
    await relConnect.upsert({ numero, session_id: sessionId });
    console.log(`✅ Session enregistrée : ${numero} ➜ ${sessionId}`);
    return true;
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement :", err.message);
    return false;
  }
}

async function relGetSession(numero) {
  const entry = await relConnect.findByPk(numero);
  if (!entry) return null;
  const session = await get_session(entry.session_id);
  return session || null;
}

async function relGetAllSessions() {
  const sessions = await relConnect.findAll({ attributes: ["numero", "session_id"] });
  return sessions.map(s => ({ numero: s.numero, session_id: s.session_id }));
}

async function relDeleteSession(numero) {
  return await relConnect.destroy({ where: { numero } });
}

module.exports = {
  relConnect,
  relSaveSession,
  relGetSession,
  relGetAllSessions,
  relDeleteSession
};
