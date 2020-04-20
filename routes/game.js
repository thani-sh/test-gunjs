const fs = require("fs");
const path = require("path");
const express = require("express");

/**
 * Keep the html file content in memory
 */
const htmlPath = path.resolve(__dirname, "../public/index.html");
const htmlBuff = fs.readFileSync(htmlPath);

/**
 * Creates the route handler function
 */
module.exports = function create(config) {
  const router = express.Router();

  router.get("/:id", async (req, res) => {
    res.set("Content-Type", "text/html");
    res.send(htmlBuff);
  });

  return router;
};
