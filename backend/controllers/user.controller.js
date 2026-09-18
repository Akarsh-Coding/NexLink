import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Profile from "../models/profile.model.js";



export const register = async (req, res) => {
    try{
        
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) return res.status(400).json({ message: "Please fill all the fields" });

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        const profile = new Profile({ userId: newUser._id });
        await profile.save();
        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Please fill all the fields" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = crypto.randomBytes(32).toString("hex");
        await User.updateOne({ _id: user._id }, { token });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    try{
        const user = await User.findOne({ token: token });

        if (!user) return res.status(404).json({ message: "User not found" });
        user.profilePicture = req.file.filename;
        await user.save();
        return res.status(200).json({ message: "Profile picture uploaded successfully" });
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}


export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...newUserData} = req.body;

        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });
        const {username, email} = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser || String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "Username or email already exists" });
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.status(200).json({ message: "User profile updated successfully" });
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}



export const getUserAndProfile = async (req, res) => {
    try{
        const token = req.query.token || req.body.token;
        if (!token) return res.status(400).json({ message: "Token is required" });

        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name username email profilePicture");

        if (!userProfile) return res.status(404).json({ message: "Profile not found" });
        return res.json(userProfile);
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}