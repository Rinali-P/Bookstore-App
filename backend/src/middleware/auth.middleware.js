import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Example
// const response = await fetch(`http://localhost:5000/api/books`, {
//     method: "POST",
//     body: JSON.stringify({
//         title,
//         caption
//     }),
//     headers: { Authorization: `Bearer ${token}`}
// });


const protectRoute = async (req, res, next) => {
  try {
    // get the token 
    const token = req.header("Authorization").replace("Bearer", "");

    if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find the user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user; // attach user to request
    next(); // proceed to the next middleware or route handler

  } catch (error) {
    console.log("Authentication error:", error.message);
    res.status(500).json({ message: "Token is not valid" });

  }
};

export default protectRoute;