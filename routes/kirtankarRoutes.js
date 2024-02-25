const express = require("express");
const kirtankarController = require("../controllers/kirtankarController");
const auth = require("../middleware/auth");

const kirtankarRouter = express.Router();

kirtankarRouter.get("/getallkirtankar", kirtankarController.getallkirtankar);

kirtankarRouter.get("/getnotkirtankar", auth, kirtankarController.getnotkirtankar);

kirtankarRouter.post("/applyforkirtankar", auth, kirtankarController.applyforkirtankar);

kirtankarRouter.put("/deletekirtankar", auth, kirtankarController.deletekirtankar);

kirtankarRouter.put("/acceptkirtankar", auth, kirtankarController.acceptkirtankar);

kirtankarRouter.put("/rejectkirtankar", auth, kirtankarController.rejectkirtankar);

module.exports = kirtankarRouter;
