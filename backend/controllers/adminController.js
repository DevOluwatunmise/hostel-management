const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");
const generateToken  = require("../utils/index");


//Register a new Admin
const register = asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    
      !fullname || !email || !password &&(() => {res.status(400);throw new Error("Please! fill all the require field");})()
    

    
      password.length < 6 &&
        (() => {
          res.status(400);
          throw new Error("Password must be up to 6 character!");
        })()
        // Check if user already exist
        const adminExists = await Admin.findOne({email});

        adminExists && (() => {res.status(400); throw new Error("Email already exist")})();

        // Create new Admin
        const admin = await Admin.create({
            fullname, email, password
        })

        const token = generateToken(admin._id);

        //send http-only codokie
        res.cookie("token", token, {
            path: "/", 
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true
        });

        if(admin) {
            const {_id, fullname, email, role } = admin;

            res.status(201).json({
                _id, fullname, email, password, role, token
            })
        }else {
            res.status(400);
            throw new Error("Invalid Data")
        }
  } catch (error) {
    console.error(error.message)
    res.status(500).send("server error")
  }
});

// Admin log in
const login = asyncHandler(async(req, res) => {
    try {
        const {email, password} = req.body;
        
        // Check if admin exist
        let admin = await Admin.findOne({email});

        if (!admin) {
            return res.status(400).json({"message": "Admin not found"});
        }

        // chech password
        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch) {
            return res.status(400).json({"message": "Invalid Credientials!"})
        }

        const token = generateToken(admin._id);

        if(admin && isMatch) {
            res.cookie("token", token, {
                path: "/", 
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // 1 day
                sameSite: "none",
                secure: true
            });

        const {_id, fullname, email, role} = admin;

        res.status(201).json({
            _id, fullname, email, role, token
        })
        } else {
            res.status(500);
            throw new Error("something went wrong!")

        }

    } catch (error) {
        console.error(error.message)
        res.status(500).send("server error")
    }
})

// Delete an Admin
const deleteAdmin = asyncHandler(async(req, res) => {
    try {
        const {adminId} = req.params
        const admin = Admin.findById(adminId);
        if(!admin) {
            res.status(404);
            throw new Error("User not found")
        }

        await admin.deleteOne();
        res.status(200).json({
            message: "Admin data deleted successfully"
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error")
    }
})

//Get details of a single admin
const getAdmin = asyncHandler(async(req, res) => {
    try {
        const {adminId} = req.params;

        const admin = await Admin.findById(adminId);

        if(admin) {
            const {_id, fullname, email, role} = admin;

            res.status(200).json({
                _id, fullname, email, role
            })
        } else {
            res.status(404).json({"message": "Admin not found"})
        }
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
})

//Get details of all admins
const getAdmins = asyncHandler(async(req, res) =>{
    const admins = await Admin.find().sort("-createdAt").select("-password");
    if(!admins) {
        res.status(500)
        throw new Error("Something went wrong")
    }

    res.status(200).json(admins)
})


const updateAdmin = asyncHandler(async (req, res) => {

    const { adminId } = req.params;
    const admin = await Admin.findById(adminId).select("-password");
  try{
  
      if (!admin) {
        res.status(404).json({error: "Admin not found"})
      }
    
  
        if (req.body?.fullname) {admin.fullname = req.body.fullname};
        if (req.body?.email) {admin.email = req.body.email};
        if (req.body?.role) {admin.role = req.body.role};
    
        const result = await admin.save();

        
        res.status(200).json(updateAdmin);
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
  
  });

  //Logout Admin
  const LogoutAdmin = asyncHandler(async(req, res) => {
    res.cookie("token", "", {
        path: "/", 
        httpOnly: true,
        expires: new Date(0), // 1 day
        sameSite: "none",
        secure: true
    });
     
    return res.status(200).json({message: "Logout Successful"})
  })


module.exports = {register, login, getAdmin, deleteAdmin, getAdmins, updateAdmin, LogoutAdmin } ;
