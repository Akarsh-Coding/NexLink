import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Profile from "../models/profile.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";




const convertUserProfileToPDF = async (userProfile) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);
    doc.pipe(stream);
    const profilePicturePath = `uploads/${userProfile.userId.profilePicture}`;
    const imagePath = fs.existsSync(profilePicturePath)
        ? profilePicturePath
        : "uploads/defaultProfile.jpg";
    doc.image(imagePath, {align: 'center', width: 100});
    doc.fontSize(14).text(`Name: ${userProfile.userId.name}`);
    doc.fontSize(14).text(`Username: ${userProfile.userId.username}`);
    doc.fontSize(14).text(`Email: ${userProfile.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userProfile.bio}`);
    doc.fontSize(14).text(`Current Position: ${userProfile.currentPost}`);

    doc.fontSize(14).text("Past Work:")
        userProfile.pastWork.forEach((work, index) => {
            doc.fontSize(14).text(`Company Name: ${work.company}`);
            doc.fontSize(14).text(`Position: ${work.position}`);
            doc.fontSize(14).text(`Years: ${work.years}`);
        });
    doc.end();
    return outputPath;
}


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



export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;
        const UserProfile = await User.findOne({ token: token });

        if (!UserProfile) return res.status(404).json({ message: "User not found" });
        const profile_to_update = await Profile.findOne({ userId: UserProfile._id });

        Object.assign(profile_to_update, newProfileData);
        await profile_to_update.save();

        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const getAllUserProfile = async (req, res) => {
    try{
        const allProfiles = await Profile.find().populate("userId", "name username email profilePicture");
        return res.status(200).json(allProfiles);
    }catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const downloadProfile = async (req, res) => {
    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id})
    .populate("userId", "name username email profilePicture");

    let outputPath = await  convertUserProfileToPDF(userProfile);
    return res.json({ 'message': outputPath})
}