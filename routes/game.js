const fs = require('fs');
const path = require('path');
const express = require('express');

/**
 * Keep the html file content in memory
 */
const htmlPath = path.resolve(__dirname, '../public/index.html');
const htmlBuff = fs.readFileSync(htmlPath);

/**
 * Creates the route handler function
 */
module.exports = function create(config) {
    const router = express.Router();
    const games = {};

    function createGame(id) {
        if (!games[id]) {
            games[id] = {
                id,
                peers: {},
                _next: 0,
            };
            console.info(`# ${id}: created!`);
        }
        return games[id];
    }

    function createPeer(game, ws) {
        const peer = {
            id: ++game._next,
            ws,
        };
        game.peers[peer.id] = peer;
        console.info(`# ${game.id}/${peer.id}: created!`);
        return peer;
    }

    function removePeer(game, peer) {
        delete game.peers[peer.id];
    }

    router.get('/:id', async (req, res) => {
        res.set('Content-Type', 'text/html')
        res.send(htmlBuff);
    });

    router.ws('/:id/ws', (ws, req) => {
        const id = req.params.id;
        const game = createGame(id);
        const peer = createPeer(game, ws);
        console.info(`# ${game.id}/${peer.id}: connected!`);
        ws.on('message', msg => {
            // console.info(`# ${game.id}/${peer.id}: recv:`, msg);
            let data = JSON.parse(msg);
            if (Array.isArray(data)) {
                data = data.flat(Infinity).filter(d => !d.cgx);
                msg = JSON.stringify(data);
                if (!data.length) {
                    return;
                }
            } else if (data.cgx) {
                return;
            }
            console.info(`# ${game.id}/${peer.id}: pass:`, msg);
            for (const [ key, val ] of Object.entries(game.peers)) {
                if (key === peer.id) {
                    continue;
                }
                val.ws.send(msg);
            }
        });
        ws.on('close', () => {
            removePeer(game, peer);
            console.info(`# ${game.id}/${peer.id}: closed!`);
        });
        ws.on('error', () => {
            removePeer(game, peer);
            console.info(`# ${game.id}/${peer.id}: errored!`);
        });
    });

    return router;
}
