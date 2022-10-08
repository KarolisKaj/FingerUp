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
    getPlayer: () => {
        return getPlayer()
    },
    getPlayers: () => {
        return getPlayers()
    },
    setActivePlayer: (id) => {
        return setActivePlayer(id)
    },
    updatePlayer: (gameId, gameResult) => {
        return updatePlayer(gameId, gameResult)
    },
    getGame: (gameName) => {
        return getGame(gameName)
    }
}

activePlayerId = null

function createPlayer(name) {
    // let player = {
    //     id,
    //     name: name,
    //     games: [
    //         name,
    //         gameResults
    //     ]
    // }
    storageLength = localStorage.length
    for (let i = 0; true; i++) {
        console.log(i)
        storedPlayer = localStorage.getItem(i)
        if (storedPlayer === null) {
            player.id = i
            localStorage.setItem(i, JSON.stringify(player))
            console.log(i)
            return i
        }
    }
}

function getPlayer() {
    storedPlayerString = localStorage.getItem(activePlayerId)
    if (storedPlayerString !== null) {
        return JSON.parse(storedPlayerString)
    }
    return null
}

function getPlayers() {
    storageLength = localStorage.length
    players = []
    for (let i = 0; true; i++) {
        storedPlayer = localStorage.getItem(i)
        if (storedPlayer !== null) {
            players.append(JSON.parse(storedPlayer))
        }
        if (players.length === storageLength) {
            return players
        }
    }
}

function setActivePlayer(id) {
    activePlayerId = id
}

function updatePlayer(gameName, gameResult) {
    player = this.getPlayer(activePlayerId)
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
    storage.setItem(activePlayerId, JSON.stringify(player))
}

function getGame(gameName) {
    player = this.getPlayer(activePlayerId)
    if (player === null || player.games === null) {
        return null
    }
    for (let i = 0; i < player.games.length; i++) {
        if (player.games[i].name === gameName) return player.games[i]
    }
    return null
}
