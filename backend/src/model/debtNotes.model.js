import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
    
    debtorName: {
        type: String,
        required: true,
        trim: true
    },
    debtorEmail: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
    },
    debtorPhone: {
        type: String,
        required: false,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount must be positive']
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    archivedAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

export default mongoose.model("Debt", debtSchema);