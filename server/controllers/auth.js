import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendOtpEmail } from '../utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');
const PENDING_FILE = path.join(__dirname, '../data/pending.json');

const getUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const getPending = () => {
    try {
        if (!fs.existsSync(PENDING_FILE)) return [];
        const data = fs.readFileSync(PENDING_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const savePending = (pending) => {
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
    console.log('=== REGISTER START ===');
    console.log('Request body:', req.body);
    try {
        const { email, password, name } = req.body;
        const users = getUsers();
        console.log('Current users count:', users.length);

        if (users.find(u => u.email === email)) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = generateOtp();
        console.log('Generated OTP:', otp);

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Password hashed');

        const otpToken = jwt.sign(
            { email, name, password: hashedPassword, otp },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );
        console.log('JWT token created');

        let pending = getPending();
        pending = pending.filter(p => p.email !== email);
        pending.push({ email, otpToken, createdAt: Date.now() });
        savePending(pending);
        console.log('Pending saved');

        console.log('About to send email to:', email);
        try {
            await sendOtpEmail(email, otp);
            console.log('Email sent successfully!');
            return res.status(200).json({ message: "OTP sent to email", email });
        } catch (emailError) {
            console.error('Email send FAILED:', emailError.message);
            console.error('Full error:', emailError);
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
        const pending = getPending();

        const pendingUser = pending.find(p => p.email === email);
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

        const users = getUsers();
        const newUser = {
            _id: Date.now().toString(),
            email: decoded.email,
            name: decoded.name,
            password: decoded.password,
            notes: []
        };

        users.push(newUser);
        saveUsers(users);

        const newPending = pending.filter(p => p.email !== email);
        savePending(newPending);

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("access_token", token, {
            httpOnly: true,
        }).status(201).json({ message: "Email verified!", user: { id: newUser._id, email: newUser.email, name: newUser.name, notes: newUser.notes } });

    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
        console.log(error);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = getUsers();

        const existingUser = users.find(u => u.email === email);
        if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("access_token", token, {
            httpOnly: true,
        }).status(200).json({ message: "Login successful", user: { id: existingUser._id, email: existingUser.email, name: existingUser.name, notes: existingUser.notes } });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const users = getUsers();

        const existingUser = users.find(u => u.email === email);
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const otp = generateOtp();
        const resetToken = jwt.sign(
            { email, otp, type: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        let pending = getPending();
        pending = pending.filter(p => p.email !== email);
        pending.push({ email, otpToken: resetToken, type: 'reset', createdAt: Date.now() });
        savePending(pending);

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
        const pending = getPending();

        const pendingReset = pending.find(p => p.email === email && p.type === 'reset');
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

        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        users[userIndex].password = hashedPassword;
        saveUsers(users);

        const newPending = pending.filter(p => !(p.email === email && p.type === 'reset'));
        savePending(newPending);

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};
