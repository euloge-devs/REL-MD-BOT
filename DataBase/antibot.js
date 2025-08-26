const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config'); // Ton fichier de config
const db = config.DATABASE;

let sequelize;

// Connexion à la base de données
if (!db) {
    // SQLite si aucune DB spécifiée
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    });
} else {
    // PostgreSQL si une DB est configurée
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

// Modèle Antibot
const Antibot = sequelize.define('Antibot', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    mode: {
        type: DataTypes.STRING,
        defaultValue: 'off'
    },
    type: {
        type: DataTypes.ENUM('supp', 'warn', 'mute'),
        defaultValue: 'supp'
    }
}, {
    tableName: 'antibot',
    timestamps: false
});

// Modèle AntibotWarnings
const AntibotWarnings = sequelize.define('AntibotWarnings', {
    groupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    tableName: 'antibot_warnings',
    timestamps: false
});

// Synchronisation des tables
(async () => {
    await Antibot.sync();
    console.log('Table Antibot synchronisée');
    
    await AntibotWarnings.sync();
    console.log('Table AntibotWarnings synchronisée');
})();

module.exports = {
    Antibot,
    AntibotWarnings
};
