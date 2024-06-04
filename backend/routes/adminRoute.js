const express = require("express");
const {register, login, getAdmin, deleteAdmin, getAdmins, updateAdmin, LogoutAdmin} = require("../controllers/adminController");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.get("/:adminId", protect, getAdmin);
router.delete("/:adminId", protect, deleteAdmin);
router.get("/", getAdmins);
router.put("/:adminId", protect, updateAdmin);
router.post("/:logout", LogoutAdmin);

module.exports = router;