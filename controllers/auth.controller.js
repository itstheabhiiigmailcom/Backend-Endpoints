import jwt from "jsonwebtoken";
import User from '../models/student.model.js';

// Generate an access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

// Generate a refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Login handler
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens to the client
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// Refreshing the access token with the help of refreshToken after every short duration
// even this refreshToken can also expires after fixed long term
const refreshTheToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token is required" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verify the refresh token exists in the database
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const accessToken = generateAccessToken(user._id);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export { login, refreshTheToken };
