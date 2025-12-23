import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Pending from '../models/Pending.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = generateOtp();
        const hashedPassword = await bcrypt.hash(password, 12);

        const otpToken = jwt.sign(
            { email, name, password: hashedPassword, otp },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        await Pending.findOneAndDelete({ email });
        await Pending.create({ email, otpToken, type: 'register' });

        try {
            await sendOtpEmail(email, otp);
            return res.status(200).json({ message: "OTP sent to email", email });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
        }

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: "Failed to register" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const pendingUser = await Pending.findOne({ email, type: 'register' });
        if (!pendingUser) {
            return res.status(400).json({ message: "No pending registration found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(pendingUser.otpToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "OTP expired. Please register again." });
        }

        if (decoded.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const newUser = new User({
            email: decoded.email,
            name: decoded.name,
            password: decoded.password,
            notes: []
        });

        await newUser.save();
        await Pending.findOneAndDelete({ email });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }).status(201).json({
            message: "Email verified!",
            user: { id: newUser._id, email: newUser.email, name: newUser.name, notes: newUser.notes }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: "Verification failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }).status(200).json({
            message: "Login successful",
            user: { id: existingUser._id, email: existingUser.email, name: existingUser.name, notes: existingUser.notes }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const otp = generateOtp();
        const resetToken = jwt.sign(
            { email, otp, type: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        await Pending.findOneAndDelete({ email, type: 'reset' });
        await Pending.create({ email, otpToken: resetToken, type: 'reset' });

        try {
            await sendOtpEmail(email, otp);
            return res.status(200).json({ message: "Reset OTP sent to email", email });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            return res.status(500).json({ message: "Failed to send reset email. Please try again." });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: "Failed to process request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const pendingReset = await Pending.findOne({ email, type: 'reset' });
        if (!pendingReset) {
            return res.status(400).json({ message: "No password reset request found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(pendingReset.otpToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "OTP expired. Please try again." });
        }

        if (decoded.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await Pending.findOneAndDelete({ email, type: 'reset' });

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};
