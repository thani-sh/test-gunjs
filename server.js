const express = require("express");
const routeTurn = require("./routes/turn");
const routeGame = require("./routes/game");

const XIRSYS_URL = process.env.XIRSYS_URL;
const CONST_PEER = process.env.CONST_PEER;
const TURN_EXPIRE = parseInt(process.env.TURN_EXPIRE, 10) || 0;
const PORT = process.env.PORT || 3000;

// configure express
const app = express();
require("express-ws")(app);
app.use("/turn", routeTurn({ XIRSYS_URL, TURN_EXPIRE }));
app.use("/game", routeGame({ CONST_PEER }));
app.use(express.static("public"));
app.listen(PORT);
