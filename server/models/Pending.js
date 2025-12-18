import mongoose from 'mongoose';

const pendingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otpToken: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['register', 'reset'],
        default: 'register'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

export default mongoose.model('Pending', pendingSchema);
