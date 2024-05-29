const express = require("express");
const { registerStudent, getAllStudent, getStudent, updateStudentProfile, changeStudentRoom, updateCheckedInStatus, deleteStudent} = require("../controllers/studentController");
const router = express.Router();


router.post("/register-student", registerStudent )
router.get("/", getAllStudent)
router.get("/:_id", getStudent);
router.patch("/:_id", updateStudentProfile);
router.post("/change-room", changeStudentRoom);
router.post("/check-in-student", updateCheckedInStatus);
router.delete("/delete-student/:_Id", deleteStudent);


module.exports = router;