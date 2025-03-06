import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/User.js";
import logger from "../../utils/logger.js";


// Constants for JWT and cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  sameSite: "strict", // Prevent CSRF attacks
};

//register
const registerUser = async (req, res) => {
  const { email, password, userName, fullName, role } = req.body;

  // Validate request body
  if (!email || !password || !userName || !fullName) {
    logger.warn("User registration failed: Missing required fields");
    return res.status(400).json({
      success: false,
      message: "All fields (email, password, userName, fullName) are required",
    });
  }

  // Validate role (default to "buyer")
  const roleValue = ["buyer", "seller"].includes(role) ? role : "buyer";

  try {
    // Check if user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      logger.warn(`User registration failed: User already exists with email ${email}`);
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }
// hash password by teh logic in the User model('pre' => hash before save)

    // Create user
    const newUser = await User.create({
      userName,
      fullName,
      email,
      password, // Store the hashed password
      role: roleValue, // Use validated role
    });

    console.log("Stored Hashed Password:", newUser.password);

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      },
    });
  } catch (error) {
    logger.error("User registration failed", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred during registration",
    });
  }
};



// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    logger.warn("Login failed: Missing email or password");
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  console.log("User is: ", req.body);

  try {
    // Check if user exists
    const user = await User.findOne({ email });
//     const user1 = await User.findOne({ email: "schoridinger@example.com" });
// console.log("Stored Password in DB:", user1.password);

    if (!user) {
      logger.warn(`Login failed: User not found with email ${email}`);
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }
    console.log("Type of entered password:", typeof password);
    console.log("Entered password:", password);
    console.log("Stored hashed password:", user.password);
        // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
console.log("Password Comparison Result:", isPasswordValid);

    if (!isPasswordValid) {
      logger.warn(`Login failed: Incorrect password for user ${email}`);
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    // Generate JWT token
    const token = user.generateAccessToken();

    // Set cookie and send response
    res.cookie("token", token, COOKIE_OPTIONS).status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName,
      },
    });

    logger.info(`User logged in successfully: ${email}`);
  } catch (error) {
    logger.error("Login failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// Logout User
const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", COOKIE_OPTIONS).status(200).json({
      success: true,
      message: "Logged out successfully",
    });

    logger.info("User logged out successfully");
  } catch (error) {
    logger.error("Logout failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    logger.warn("Auth middleware: No token provided");
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;  // Attach user info to `req`
    next();
  } catch (error) {
    logger.error("Auth middleware: Invalid token", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid token.",
    });
  }
};

export { registerUser, loginUser, logoutUser, authMiddleware };
