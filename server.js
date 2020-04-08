const express = require('express');
const gun = require('gun');

const app = express();

app.use(gun.serve);
app.use(express.static('public'));

const server = app.listen(process.env.PORT);
const gunServer = gun({ file: 'data', web: server });
