const express = require("express");
const {createNewRoom, getAllRooms, getRoom, updateRoom, deleteRoom  } = require("../controllers/roomController");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")


router.post("/createNewRoom", protect, createNewRoom )
router.get("/get-all-rooms", protect, getAllRooms)
router.get("/get-single-room/:roomId", protect, getRoom);
router.patch("/update-room/:roomId", protect, updateRoom);
router.delete("/delete-room/:roomId", protect, deleteRoom);


module.exports = router