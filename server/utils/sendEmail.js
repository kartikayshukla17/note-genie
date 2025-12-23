import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Note Genie - Verify Your Email',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #7c3aed;">Note Genie</h2>
                <p>Your verification code is:</p>
                <h1 style="font-size: 36px; letter-spacing: 8px; color: #7c3aed; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
                <p>This code expires in 5 minutes.</p>
                <p style="color: #71717a; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

