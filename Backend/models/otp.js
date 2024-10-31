const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    otp: {
        type: String,
        required: true,
        min: 6,
        max: 6
    },
    createdAt: { type: Date, expires: '5m', default: Date.now }
},{
    timestamps: true
});

module.exports = mongoose.model('Otp', otpSchema);