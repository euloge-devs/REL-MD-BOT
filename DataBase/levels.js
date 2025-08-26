const relLevels = [
  { level: 1, name: "Novice", expRequired: 100 },
  { level: 2, name: "Apprenti", expRequired: 300 },
  { level: 3, name: "Élève", expRequired: 600 },
  { level: 4, name: 'Aspirant', expRequired: 1000 },
  { level: 5, name: "Aventurier", expRequired: 1500 },
  { level: 6, name: "Explorateur", expRequired: 2100 },
  { level: 7, name: 'Guerrier', expRequired: 2800 },
  { level: 8, name: "Vétéran", expRequired: 3600 },
  { level: 9, name: "Champion", expRequired: 4500 },
  { level: 10, name: "Héros", expRequired: 5500 },
  // ... tu peux continuer jusqu'au niveau 100 ou plus, selon ton tableau
  { level: 100, name: "Dieu Suprême", expRequired: 805000 }
];

function calculateLevel(exp) {
  for (let i = Levels.length - 1; i >= 0; i--) {
    if (exp >= Levels[i].expRequired) {
      return Levels[i].level;
    }
  }
  return Levels[0].level;
}

module.exports = {
  levels: Levels,
  calculateLevel
};
