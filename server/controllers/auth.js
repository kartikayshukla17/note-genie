import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');


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

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const users = getUsers();


        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: "User already exists" });
        }


        const hashedPassword = await bcrypt.hash(password, 12);


        const newUser = {
            _id: Date.now().toString(),
            email,
            name,
            password: hashedPassword,
            notes: []
        };

        users.push(newUser);
        saveUsers(users);


        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.cookie("access_token", token, {
            httpOnly: true,
        }).status(201).json({ message: "User registered successfully", user: { id: newUser._id, email: newUser.email, name: newUser.name, notes: newUser.notes } });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
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
