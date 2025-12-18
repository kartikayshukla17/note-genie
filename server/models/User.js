import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Untitled'
    },
    content: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Number,
        default: () => Date.now()
    },
    lastUpdate: {
        type: Number,
        default: () => Date.now()
    }
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
    notes: {
        type: [noteSchema],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
