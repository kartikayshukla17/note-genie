import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.get('/', (req, res) => {
    res.send('Note Genie API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
