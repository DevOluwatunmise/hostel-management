const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomNumber: {
      type: Number,
      required: true,
    },
    roomCapacity: {
      type: Number,
      required: true,
    },
    roomOccupancy: [
      {
      type: String,
      ref: "Student",
      }
    ],
    roomLocation: {
      type: String,
      required: true,
    },
    roomStatus: {
      type: String,
      default: "available"
 },

});

const Room = mongoose.model("Room", roomSchema)
module.exports = Room;
