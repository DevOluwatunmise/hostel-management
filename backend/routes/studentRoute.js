const express = require("express");
const { registerStudent, getAllStudent, getStudent, updateStudentProfile, changeStudentRoom, updateCheckedInStatus, deleteStudent} = require("../controllers/studentController");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")


router.post("/register-student", registerStudent )
router.get("/", protect, getAllStudent)
router.get("/:_id", protect, getStudent);
router.patch("/:_id", protect, updateStudentProfile);
router.post("/change-room", protect, changeStudentRoom);
router.post("/check-in-student", protect, updateCheckedInStatus);
router.delete("/delete-student/:_Id", protect, deleteStudent);


module.exports = router;