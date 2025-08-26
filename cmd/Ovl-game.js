// Tic-Tac-Toe pour WhatsApp (version lisible)

let activeGames = [];

function getMentionedUser(message) {
    // Retourne le premier utilisateur mentionné dans le message
    return message.mentions && message.mentions[0] ? message.mentions[0] : null;
}

function getRandomSymbol() {
    // Retourne un symbole aléatoire pour le joueur ('❌' ou '⭕')
    return Math.random() < 0.5 ? '❌' : '⭕';
}

function isPositionValid(board, position) {
    // Vérifie si une position est libre sur le plateau
    return board[position] === null;
}

function createEmptyBoard() {
    // Crée un plateau vide de 3x3
    return Array(9).fill(null);
}

function displayBoard(board) {
    // Retourne une représentation du plateau en texte
    return `
${board[0] || '1'} | ${board[1] || '2'} | ${board[2] || '3'}
---------
${board[3] || '4'} | ${board[4] || '5'} | ${board[5] || '6'}
---------
${board[6] || '7'} | ${board[7] || '8'} | ${board[8] || '9'}
`;
}

function checkWin(board, symbol) {
    // Vérifie si le symbole a gagné
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
        [0, 4, 8], [2, 4, 6]             // diagonales
    ];
    return winCombos.some(combo => combo.every(idx => board[idx] === symbol));
}

function startGame(player1, player2) {
    const board = createEmptyBoard();
    const symbols = {
        [player1]: getRandomSymbol(),
        [player2]: null
    };
    symbols[player2] = symbols[player1] === '❌' ? '⭕' : '❌';

    const game = {
        players: [player1, player2],
        board,
        symbols,
        currentPlayer: player1
    };
    activeGames.push(game);
    return game;
}

function makeMove(game, player, position) {
    if (game.currentPlayer !== player) {
        return `Ce n'est pas ton tour, ${player}!`;
    }
    if (!isPositionValid(game.board, position)) {
        return 'Position déjà prise, choisis-en une autre.';
    }
    game.board[position] = game.symbols[player];

    if (checkWin(game.board, game.symbols[player])) {
        activeGames = activeGames.filter(g => g !== game);
        return `🎉 ${player} a gagné !\n${displayBoard(game.board)}`;
    }

    if (!game.board.includes(null)) {
        activeGames = activeGames.filter(g => g !== game);
        return `Match nul !\n${displayBoard(game.board)}`;
    }

    // Tour suivant
    game.currentPlayer = game.players.find(p => p !== player);
    return `Tour de ${game.currentPlayer}.\n${displayBoard(game.board)}`;
}

// Exemple d'utilisation avec un bot WhatsApp
function handleMessage(message) {
    const command = message.body.split(' ')[0];
    const args = message.body.split(' ').slice(1);

    if (command === '.tictactoe') {
        const opponent = getMentionedUser(message);
        if (!opponent) return 'Veuillez mentionner un joueur pour commencer.';
        const game = startGame(message.sender, opponent);
        return `Jeu lancé entre ${message.sender} et ${opponent} !\n${displayBoard(game.board)}\n${game.currentPlayer}, commencez !`;
    }

    if (command === '.move') {
        const position = parseInt(args[0], 10) - 1;
        const game = activeGames.find(g => g.players.includes(message.sender));
        if (!game) return 'Aucun jeu en cours.';
        return makeMove(game, message.sender, position);
    }

    return 'Commande inconnue.';
}
