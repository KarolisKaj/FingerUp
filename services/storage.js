//player = {
//     id,
//     name,
//     games: [
//         name,
//         gameResults: [],
//     ]
// }
import AsyncStorage from '@react-native-async-storage/async-storage';

export default storage = {
    createPlayer: async (name) => {
        return await createPlayer(name)
    },
    getPlayer: async () => {
        return await getPlayer()
    },
    getPlayers: async () => {
        return await getPlayers()
    },
    setActivePlayer: (id) => {
        return setActivePlayer(id)
    },
    updatePlayer: async (gameId, gameResult) => {
        return await updatePlayer(gameId, gameResult)
    },
    getGame: async (gameName) => {
        return await getGame(gameName)
    }
}

activePlayerId = null

async function createPlayer(name) {
    let player = {
        id: 0,
        name: name,
        games: []
    }
    try {
        let allKeys = new Set(await AsyncStorage.getAllKeys())
        for (let i = 0; true; i++) {
            if (allKeys.size === i || !allKeys.has(String(i))) {
                let key = String(i)
                player.id = key
                await AsyncStorage.setItem(key, JSON.stringify(player))
                return key
            }
        }
    } catch (e) {
        console.log(e)
    }
}

async function getPlayer() {
    try {
        let storedPlayerString = await AsyncStorage.getItem(activePlayerId)
        if (storedPlayerString !== null) {
            return JSON.parse(storedPlayerString)
        }
        return null
    }
    catch (e) {
        console.log(e)
    }
}

async function getPlayers() {
    try {
        let storageLength = (await AsyncStorage.getAllKeys()).length
        let players = []
        for (let i = 0; true; i++) {
            let storedPlayer = await AsyncStorage.getItem(String(i))
            console.log(storedPlayer)
            if (storedPlayer !== null) {
                players.push(JSON.parse(storedPlayer))
            }
            if (players.length === storageLength) {
                return players
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

function setActivePlayer(id) {
    activePlayerId = id
}

async function updatePlayer(gameName, gameResult) {
    try {
        let player = await getPlayer()
        let gameExists = player.games.some(x => x.name === gameName)
        if (gameExists) {
            for (let i = 0; i < player.games.length; i++) {
                let game = player.games[i];
                if (game.name === gameName) {
                    game.gameResults.push(gameResult)
                }
            }
        } else {
            player.games.push({
                name: gameName,
                gameResults: [gameResult]
            })
        }
        await AsyncStorage.setItem(activePlayerId, JSON.stringify(player))
    }
    catch (e) {
        console.log(e)
    }
}

async function getGame(gameName) {
    try {
        let player = await getPlayer(activePlayerId)
        if (player === null || player.games === null) {
            return null
        }
        for (let i = 0; i < player.games.length; i++) {
            if (player.games[i].name === gameName) return player.games[i]
        }
        return null
    }
    catch (e) {
        console.log(e)
    }
}
