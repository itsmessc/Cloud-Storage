const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  });
  
otpSchema.methods.matchotp = async function (enteredPassword) {
return await bcrypt.compare(enteredPassword, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);