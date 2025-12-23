import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
    // Debug credentials (masked)
    console.log(`[Email Config] User: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'MISSING'}`);
    console.log(`[Email Config] Pass Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : '0'}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('[Email] Connection to Gmail verified successfully');
    } catch (error) {
        console.error('[Email] Connection verification FAILED:', error);
        throw error; // Initial connection failed
    }

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

    try {
        console.log(`[Email] Attempting to send OTP to ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Success! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`[Email] FAILED to send to ${email}. Error: ${error.message}`);
        console.error(`[Email] Stack: ${error.stack}`);
        throw error; // Re-throw to be handled by controller
    }
};

