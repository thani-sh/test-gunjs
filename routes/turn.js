const express = require('express');
const fetch = require('node-fetch');

/**
 * Creates the route handler function
 */
module.exports = function create(config) {
    const router = express.Router();

    async function getDefaultIce() {
        return {
            iceServers: { urls: 'stun:stun.l.google.com:19302' },
        };
    }

    async function getXirsysIce() {
        const content = JSON.stringify({ format: 'urls' });
        const headers = { 'Content-Type': 'application/json' };
        const options = { method: 'PUT', body: content, headers };
        const data = await fetch(config.XIRSYS_URL, options)
            .then(res => res.json());
        return data.v;
    }

    router.get('/', async (req, res) => {
        if (!config.XIRSYS_URL) {
            res.json(await getDefaultIce());
            return;
        }
        try {
            res.json(await getXirsysIce());
        } catch (err) {
            console.error(err && err.stack || err);
            res.json(await getDefaultIce());
        }
    });

    return router;
}
