import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['folder', 'note'], required: true },
    name: { type: String, default: 'New Folder' },
    title: { type: String, default: 'Untitled' },
    content: { type: String, default: '' },
    children: { type: [], default: [] },
    createdAt: { type: Number, default: () => Date.now() },
    lastUpdate: { type: Number, default: () => Date.now() }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    folders: {
        type: [itemSchema],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
