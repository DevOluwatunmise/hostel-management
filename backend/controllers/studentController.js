const asyncHandler = require("express-async-handler");
const Student = require("../models/studentModel");
const Room = require("../models/roomModel");
const { generateUniqueId } = require("../utils/generateUniqueId");
const { checkout } = require("../routes/roomRoute");

// To generate new uniqueId for new student which is must be different from already generated one
// if the random uniqueId generated is the same, it should re start again to generate new uniqueIdar

const ensureUniqueId = async () => {
  let uniqueId;
  let idExists = true;

  while (idExists) {
    uniqueId = generateUniqueId();
    const existingStudent = await Student.findById(uniqueId);
    idExists = !!existingStudent;
  }

  return uniqueId;
};

const date = new Date();

const formatDate = (input) => {
  // if the input(time) is less than 9 it shoul add 0 to the front (01 - 09) bcos we are using 24hrs not 12
  return input > 9 ? input : `0${input}`;
};

const formatHour = (input) => {
  return input > 12 ? input - 12 : input;
};

const format = {
  dd: formatDate(date.getDate()),
  mm: formatDate(date.getMonth() + 1), // we add +1 bcos javascript start from 0
  yyyy: formatDate(date.getFullYear()),

  HH: formatDate(date.getHours()),
  hh: formatDate(formatHour(date.getHours())),
  MM: formatDate(date.getMinutes()),
  SS: formatDate(date.getSeconds()),
};

const format24Hour = ({ dd, mm, yyyy, HH, MM, SS }) => {
  return `${mm}/${dd}/${yyyy} ${HH}:${MM}:${SS}`;
};

const registerStudent = asyncHandler(async (req, res) => {
  try {
    const { email, name, age, nationality, g_name, g_email, gender, roomNum } =
      req.body;

    if (
      !email ||
      !name ||
      !age ||
      !nationality ||
      !g_name ||
      !g_email ||
      !gender ||
      !roomNum
    ) {
      res.status(400);
      throw new Error("Please fill in all the required fields.");
    }

    const studentExist = await Student.findOne({ email });

    if (studentExist) {
      return res.status(400).json({ msg: "Student already exists" });
    }

    const room = await Room.findOne({ roomNumber: roomNum });

    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    if (room.roomStatus !== "available") {
      return res.status(400).json({ msg: "Room is not available" });
    }

    const uniqueId = await ensureUniqueId();

    const student = await Student.create({
      _id: uniqueId,
      email,
      name,
      age,
      nationality,
      guardian: {
        guardianName: g_name,
        guardianEmail: g_email,
      },
      gender,
      room: room._id, // Assign the room's ObjectId to the student
      checkedIn: true,
      checkedInTime: format24Hour(format),
    });

    room.roomOccupancy.push(student._id);

    if (room.roomOccupancy.length >= room.roomCapacity) {
      room.roomStatus = "unavailable";
    }

    await room.save();

    res.status(201).json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

const getAllStudent = asyncHandler(async (req, res) => {
  const students = await Student.find().sort("-createdAt");

  if (!students) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(students);
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params._id);

  if (student) {
    res.status(200).json(student);
  } else {
    res.status(404);
    throw new Error("Student not found!");
  }
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params._id);

  if (student) {
    const { email, name, age, nationality, gender, guardian } = student;

    student.email =  email;
    student.gender =  gender;
    student.age = req.body.age || age;
    student.name = req.body.name || name;
    student.nationality = req.body.nationality || nationality;
    student.guardian.guardianName = req.body.g_name || guardian.g_name;
    student.guardian.guardianEmail = req.body.g_email || guardian.g_email;

    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } else {
    res.status(404);
    throw new Error("Student not Found");
  }
});

const changeStudentRoom = asyncHandler(async (req, res) => {
  const { studentId, newRoomNum } = req.body;

  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student noy found" });
  }

  const currentRoom = await Room.findById(student.room);

  if (currentRoom) {
    currentRoom.roomOccupancy = currentRoom.roomOccupancy.filter(
      (occupant) => occupant.toString() !== studentId
    );

    if (currentRoom.roomOccupancy.length < currentRoom.roomCapacity) {
      currentRoom.status = "available";
    }

    await currentRoom.save();
  }

  const newRoom = await Room.findOne({ roomNumber: newRoomNum });

  if (!newRoom) {
    return res.status(404).json({ message: "New room not found" });
  }
  if (newRoom.roomStatus !== "available") {
    return res.status(400).json({ message: "New room is not available" });
  }

  student.room = newRoom._id;

  newRoom.roomOccupancy.push(student._id);

  if (newRoom.roomOccupancy.length >= newRoom.roomOccupancy) {
    newRoom.roomStatus = "unavailable";
  }

  await newRoom.save();
  await student.save();

  res
    .status(200)
    .json({ message: "Room change succesfully", student, newRoom });
});

const updateCheckedInStatus = asyncHandler(async (req, res) => {
  const { studentId, action, roomNumber } = req.body;

  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ messge: "Student not found" });
  }

  if (action === "checkIn") {
    student.checkedIn = true;
    student.checkedInTime = format24Hour(format);
  } else if (action === "checkOut") {
    student.checkedIn = false;
    student.checkedOutTime = format24Hour(format);
  } else {
    return res.status(400).json({
      message: "Invalid action",
    });
  }

  const room = await Room.findOne({ roomNumber });
  if (!room) {
    return res.status(404).json({ msg: "Room not found" });
  }

  if (action === "checkIn") {
    room.roomOccupancy.push(studentId);
  } else if (action === "checkout") {
    room.roomOccupancy.pull(studentId);
  }

  await room.save();
  await student.save();

  res
    .status(200)
    .json({ message: `Student ${action} successfully`, student, room });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const studentId = req.params._id;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error("Student not found in database");
    }

    const room = await Room.findById(student.room);

    if (room) {
      room.roomOccupancy = room.roomOccupancy.filter(
        (occupant) => occupant.toString() !== studentId
      );

      if (room.roomOccupancy.length < room.roomCapacity) {
        room.roomStatus = "available";
      }

      await room.save();
    }
    await student.deleteOne();
    res.status(200).json({
      message: "Student deleted successfully!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = {
  registerStudent,
  getAllStudent,
  getStudent,
  updateStudentProfile,
  changeStudentRoom,
  updateCheckedInStatus,
  deleteStudent,
};
