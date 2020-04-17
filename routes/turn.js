const express = require('express');
const fetch = require('node-fetch');

// NOTE: time is in seconds
const TURN_EXPIRE = 60 * 5;

async function getDefaultIce() {
    return {
        iceServers: { urls: 'stun:stun.l.google.com:19302' },
    };
}

function hasTurnServers(iceServers) {
    if (!Array.isArray(iceServers.urls)) {
        return false;
    }
    return !!iceServers.urls.find(url => url.startsWith('turn:'));
}

let cachedIce = { time: 0, data: null };
async function getXirsysIce() {
    if ( Date.now() < cachedIce.time + TURN_EXPIRE * 1000 ) {
        return cachedIce.data;
    }
    const content = JSON.stringify({
        format: 'urls',
        expire: Math.floor(TURN_EXPIRE * 0.8),
    });
    const headers = { 'Content-Type': 'application/json' };
    const options = { method: 'PUT', body: content, headers };
    const data = await fetch(config.XIRSYS_URL, options)
        .then(res => res.json());
    if (hasTurnServers(data.v.iceServers)) {
        cachedIce = { time: Date.now(), data: data.v };
    }
    return cachedIce.data;
}

/**
 * Creates the route handler function
 */
module.exports = function create(config) {
    const router = express.Router();

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
