import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import generateTokens from "../utils/GenerateTokens.js";

const signUp = async (req, res) => {
    try {
        const {email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, refreshTokens: [] });
        await newUser.save();
        res.status(201).json({ 
            message: "User created successfully. Please sign in."
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        await user.save();
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });
        res.status(200).json({ message: "User signed in successfully" ,user:{email: user.email, role: user.role}});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const signOut = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findByIdAndUpdate(decoded.id, {
                $pull: { refreshTokens: { token: refreshToken } }
            });
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }

};

const refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }
  
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findOne({ _id: decoded.id });
      
      // Check token exists in database
      const tokenIndex = user.refreshTokens.findIndex(t => t.token === refreshToken);
      if (tokenIndex === -1) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
  
      // new tokens creation
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
        generateTokens(user._id);
  
      // Update refresh token in db
      user.refreshTokens[tokenIndex] = { 
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      await user.save();
  
      // new cookies
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000
      });
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
  
      res.json({ 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(403).json({ message: "Invalid refresh token" });
    }
  };

export { signUp, signIn, signOut, refreshToken };
