// verify user before any authorizations
import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  // Get token from header or cookies
  const authHeader = req.headers.authorization;
  const accessTokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const accessTokenFromCookie = req.cookies.accessToken;

  // Choose token from header first, fallback to cookie if header is absent
  const token = accessTokenFromHeader || accessTokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized to access this resource. Token is missing." });
  }

  try {
    // Verify the token using JWT
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // Attach payload (e.g., user ID) to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

export { authenticate };
