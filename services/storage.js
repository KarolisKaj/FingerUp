//player = {
//     id,
//     name,
//     games: [
//         name,
//         gameResults,
//     ]
// }


export default storage = {
    createPlayer: (name) => {
        return createPlayer(name)
    },
    getPlayer: (id) => {
        return getPlayer(id)
    },
    updatePlayer: (playerId, gameId, gameResult) => {
        return updatePlayer(playerId, gameId, gameResult)
    },
    getGame: (playerId, gameName) => {
        return getGame(playerId, gameName)
    }
}

function createPlayer(name) {
    let player = {
        id,
        name: name,
        games: [
            name,
            gameResults
        ]
    }
    storageLength = localStorage.length
    for (let i = 0; true; i++) {
        storedPlayer = localStorage.getItem(i)
        if (storedPlayer === null) {
            player.id = i
            localStorage.setItem(i, JSON.stringify(player))
            return i
        }
    }
}

function getPlayer(id) {
    storedPlayerString = localStorage.getItem(id)
    if (storedPlayerString !== null) {
        return JSON.parse(storedPlayerString)
    }
    return null
}

function updatePlayer(playerId, gameName, gameResult) {
    player = this.getPlayer(playerId)
    if (player.games === null) {
        player.games = [{
            name: gameName,
            gamesReults: [gameResult]
        }]
    } else {
        player.games.forEach((game, index) => {
            if (game.name === gameName) {
                game.gameResult.append(gameResult)
                return
            }
            if (index === player.games.length - 1) {
                player.games.append({
                    name: gameName,
                    gameResults: [gameResult]
                })
                return
            }
        });
    }
    storage.setItem(playerId, JSON.stringify(player))
}

function getGame(playerId, gameName) {
    player = this.getPlayer(playerId)
    if (player === null || player.games === null) {
        return null
    }
    for (let i = 0; i < player.games.length; i++) {
        if (player.games[i].name === gamename) return player.games[i]
    }
    return null
}
