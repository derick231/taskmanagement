import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
 
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"
 
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user info to request object
    req.user = decoded;

    next(); // Pass control to next middleware/route
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};
