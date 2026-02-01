// ============================================================================
// Email Service
// Located: backend/src/utils/email.js
// Handles: Sending emails for authentication, notifications
// ============================================================================

const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
    // Try SSL connection on port 465 (more reliable)
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Generate Welcome Email HTML Template
const generateWelcomeEmailHTML = (userName) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ShivBAS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header Section with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%); padding: 40px 30px; text-align: center;">
                            
                            <!-- Logo Circle -->
                            <table role="presentation" style="margin: 0 auto 20px auto;">
                                <tr>
                                    <td style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 16px; text-align: center; vertical-align: middle;">
                                        <span style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">SB</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Welcome Badge -->
                            <table role="presentation" style="margin: 0 auto 15px auto;">
                                <tr>
                                    <td style="background-color: rgba(0, 0, 0, 0.2); padding: 8px 20px; border-radius: 20px;">
                                        <span style="font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">🎉 WELCOME ABOARD</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Main Heading -->
                            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                Welcome to <span style="background-color: #fbbf24; color: #1e3a5f; padding: 2px 8px; border-radius: 4px;">ShivBAS</span>!
                            </h1>
                            <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                                Your account is ready to use
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body Section -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 20px 0; font-size: 18px; color: #1f2937;">
                                Hello <strong style="color: #0ea5e9;">${userName}</strong>,
                            </p>
                            
                            <!-- Message -->
                            <p style="margin: 0 0 25px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                                Great news! You have successfully logged into <span style="background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 600;">ShivBAS</span> - 
                                Budget & Analytics System. Your session is now active and you have full access to all features.
                            </p>
                            
                            <!-- Info Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr>
                                    <td style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px 20px; border-radius: 0 8px 8px 0;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #0369a1; font-weight: 600;">
                                            📊 What you can do:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                                            <li>Manage budgets and track expenses</li>
                                            <li>Create invoices and purchase bills</li>
                                            <li>View analytics and reports</li>
                                            <li>Process payments securely</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr>
                                    <td style="background-color: #fef3c7; padding: 15px 20px; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 13px; color: #92400e;">
                                            🔒 <strong>Security Notice:</strong> If you didn't log in, please change your password immediately and contact support.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 8px; text-align: center;">
                                        <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 14px 35px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 600;">
                                            Go to Dashboard →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="text-align: center;">
                                        <!-- Footer Logo -->
                                        <table role="presentation" style="margin: 0 auto 15px auto;">
                                            <tr>
                                                <td style="background-color: #0ea5e9; width: 40px; height: 40px; border-radius: 8px; text-align: center; vertical-align: middle;">
                                                    <span style="font-size: 16px; font-weight: bold; color: #ffffff;">SB</span>
                                                </td>
                                                <td style="padding-left: 10px;">
                                                    <span style="font-size: 18px; font-weight: 700; color: #1f2937;">ShivBAS</span>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">
                                            Budget & Analytics System
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                            © ${new Date().getFullYear()} ShivBAS. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Send Login Welcome Email - Beautiful HTML notification
const sendLoginWelcomeEmail = async (userEmail, userName) => {
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_USER;

    console.log('Attempting to send welcome email to:', userEmail);
    console.log('Using email:', fromEmail);

    try {
        const info = await transporter.sendMail({
            from: `"ShivBAS" <${fromEmail}>`,
            to: userEmail,
            subject: '🎉 Welcome to ShivBAS - Login Successful!',
            text: `Hello ${userName}, You have successfully logged in to ShivBAS - Budget & Analytics System. Your session is now active.`,
            html: generateWelcomeEmailHTML(userName)
        });
        console.log('✅ Login welcome email sent to:', userEmail, 'MessageId:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending login email:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendLoginWelcomeEmail
};
