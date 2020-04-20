const express = require("express");
const Gun = require("gun");
const routeTurn = require("./routes/turn");
const routeGame = require("./routes/game");

const XIRSYS_URL = process.env.XIRSYS_URL;
const PORT = process.env.PORT || 3000;

// configure express
const app = express();
app.use(Gun.serve);
app.use(express.static(__dirname));
app.use("/turn", routeTurn({ XIRSYS_URL }));
app.use("/game", routeGame({}));
app.use(express.static("public"));
const web = app.listen(PORT);
const gun = Gun({ web });
