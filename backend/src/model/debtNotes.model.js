import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true
    },

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
    debtorProfilePic: {
        type: String,
        required: false,
        trim: true
    },
    debtorAddress: {
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

    guarantor: {
        name: {
            type: String,
            required: false,
            trim: true
        },
        phone: {
            type: String,
            required: false,
            trim: true
        }
    },

    // 🆕 NEW: Contract Terms (Optional)
    contract: {
        // Interest charges
        interest: {
            enabled: {
                type: Boolean,
                default: false
            },
            everyDays: {
                type: Number,
                required: false,
                min: 1
            },
            chargeAmount: {
                type: Number,
                required: false,
                min: 0
            }
        },
        
        // Late fee charges
        lateFee: {
            enabled: {
                type: Boolean,
                default: false
            },
            everyDays: {
                type: Number,
                required: false,
                min: 1
            },
            chargeAmount: {
                type: Number,
                required: false,
                min: 0
            }
        },
        
        // Track when contract was added
        createdAt: {
            type: Date,
            required: false
        }
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