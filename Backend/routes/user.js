const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserFoldersAndFiles } = require('../actions/user');
const Otp = require('../models/otp');
const User = require('../models/user');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const router = express.Router();
const jwt=require('jsonwebtoken');
// Route to fetch all folders and files (public and private) of a user
router.get('/:userId/folders', protect, getUserFoldersAndFiles);

router.post('/sendOTP', async (req, res) => {
    const { email } = req.body;
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

    try {
        let otprec = await Otp.findOne({ email });
        if (otprec) {
            otprec.otp = otp;
            otprec.createdAt = new Date();
            await otprec.save();
        } else {
            await Otp.create({ email, otp });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.MAIL,
                pass: process.env.PASS
            }
        });

        await transporter.sendMail({
            from: `ASA Cloud Storage <${process.env.EMAIL}>`,
            to: email,
            subject: 'OTP for Verification',
            text: `Your OTP for verification is: ${otp}`
        });

        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Failed to send OTP');
    }
});
router.post('/validateotp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).send('OTP record not found');
        }

        if (otpRecord.matchotp(otp)) {
            // Check if user exists
            const user = await User.findOne({ email });

                const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
                res.status(200).json({ message: 'OTP verified successfully',token,
                    user: {
                      id: user._id,
                      username: user.username,
                      email: user.email,
                    },});
        } else {
            res.status(400).send('Invalid OTP');
        }
    } catch (error) {
        console.error('Error validating OTP:', error);
        res.status(500).send('Failed to validate OTP');
    }
});

router.post('/check-username', async (req, res) => {
    const { username } = req.body;
  
    try {
      // Check if a user with the given username exists
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(200).json({ available: false, message: 'Username already taken' });
      } else {
        return res.status(200).json({ available: true, message: 'Username is available' });
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      return res.status(500).json({ available: null, message: 'Server error, please try again later.' });
    }
  });


module.exports = router;
