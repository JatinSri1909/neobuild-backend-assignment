const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        // Will store encrypted value
    },
    email: {
        type: String,
        required: true,
        // Will store encrypted value
    },
    education: {
        degree: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        year: {
            type: String,
            required: true
        }
    },
    experience: {
        job_title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        start_date: {
            type: String,
            required: true
        },
        end_date: {
            type: String,
            required: true
        }
    },
    skills: [{
        type: String,
        required: true
    }],
    summary: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create text index for case-insensitive search
applicantSchema.index({ name: 'text' });

// Add a pre-save hook to handle any necessary data transformations
applicantSchema.pre('save', function(next) {
    // You can add any pre-save validations or transformations here
    next();
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;