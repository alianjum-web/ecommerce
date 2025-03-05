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

  //validate request body
  if (!email || !password || !userName || !fullName) {
    logger.warn("User registeration failed: Missing required fields");
    return res.status(400).json({
      succes: false,
      message: "All fields (email, password, userName, fullName) are required"
    });
  }
if (!["buyer", "seller"].includes(role)) {
  return res.status(400).json({
    succes: false,
    message: "Invalid role selected."
  })
}
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      logger.warn(`User registeration failed: User already exists with email ${email}`);
      return res.status(409).json({
        success: false,
        message: "User already exist with this email",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      fullName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registered successful",
    });
  } catch (error) {
    logger.error("User registeration failed", error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
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

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found with email ${email}`);
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
