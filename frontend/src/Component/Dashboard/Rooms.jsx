import { IoMenu, IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import RoomTable from "./RoomTable";
import Sidebar from "./Sidebar";
import axios from "axios";
import {confirmAlert} from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import useAuthRedirect from "../../../context/useAuth";

const Rooms = () => {
  useAuthRedirect();

  const [roomData, setRoomData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchresult, setSeartchResult] = useState([]);
  const [message, setMessage] = useState("");
  const [sidebarToggle, setSidebarToggle] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "https://hostel-management-two.vercel.app/room/get-all-rooms"
        );
        setRoomData(response.data);
      } catch (error) {
        setIsLoading(false);
        if (error.response && error.response.status === 400) {
          setMessage("Cannot fetch room...");
        } else {
          setMessage("Server error!");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // to search for room using their location and status{also we can use number, occupancy }
  useEffect(() => {
    const filteredRooms = roomData.filter((res) => {
      const roomLocation = res.roomLocation?.toLowerCase() || "";
      const roomStatus = res.roomStatus?.toLowerCase() || "";

      return (
        roomLocation.includes(search.toLowerCase()) ||
        roomStatus.includes(search.toLowerCase())
      );
    });
    setSeartchResult(filteredRooms);
  }, [roomData, search]);

  const handleAddRoom = (newRoomData) => {
    setRoomData((prevData) => [...prevData, newRoomData]);
  };
  
  // we are checking if the id of the room we are updating in the modal is the same with one in the data base
  const handleUpdateRoom = (updatedRoomData) => {
    setRoomData((prevData) =>
      prevData.map((room) =>
        room._id === updatedRoomData._id ? updatedRoomData : room 
      )
    );
  };

  const removeRoom = async (id) => {
    try {
      await axios.delete(`https://hostel-management-two.vercel.app/room/delete-room/${id}`);
      setRoomData((prevRoomData) => prevRoomData.filter((room) => room._id !== id));
    } catch (error) {
      console.error("Failed to delete room", error)
    }
  }
   // to confirm that, are yu truely want to delete the data or not(double check) when it pulp up
   const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete this Room",
      message: "Are you sure to delete this Room?",
      buttons: [
        {
          label: "Delete",
          onClick: () => removeRoom(id) 
        },
        {
          label: "Cancel",
          onClick: () => alert("Deletion cancelled"),
        }
      ]
    })
  }

  

  return (
    <>
      <div>
        {sidebarToggle && (
          <div className="mobile-side-nav">
            <Sidebar />
          </div>
        )}

        <div className="--flex justify-between">
          <div className="desktop-side-nav">
            <Sidebar />
          </div>

          <div className="--flex-dir-column --overflow-y-auto --flex-1 --overflow-x-hidden">
            <main className="--flex-justify-center w-full">
              <div className="right dash-main">
                <div>
                  <h1>Hostel Room Listing</h1>

                  {sidebarToggle ? (
                    <IoCloseSharp
                      className="sidebar-toggle-iconB"
                      onClick={() => setSidebarToggle(false)}
                    />
                  ) : (
                    <IoMenu
                      className="sidebar-toggle-iconB"
                      onClick={() => setSidebarToggle(true)}
                    />
                  )}
                </div>
                <input
                  placeholder="Search by room number, status, or location"
                  type="text"
                  className="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <RoomTable
                  rooms={searchresult}
                  onAddRoom={handleAddRoom}
                  onUpdateRoom={handleUpdateRoom}
                  onDeleteRoom={confirmDelete}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rooms;
