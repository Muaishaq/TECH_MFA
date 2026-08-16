const nodemailer = require('nodemailer');
const prisma = require('../config/db');

// Transporter configuration
let transporter = null;

// Initialize transporter if SMTP credentials are available
function initTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email Service] SMTP credentials not configured. Email sending will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

// Send welcome email on registration
async function sendWelcomeEmail(user) {
  if (!transporter) {
    console.warn('[Email Service] Skipping welcome email - SMTP not configured');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFA Platform" <noreply@mfaacademy.com>',
      to: user.email,
      subject: 'Welcome to MFA Academy! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A0F2C, #1a1f3c); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #F5F5F0; margin: 0;">Welcome to MFA Academy</h1>
            <p style="color: #F5F5F0; opacity: 0.8; margin: 10px 0 0 0;">Your journey starts now</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Hi ${user.full_name},
          </p>
          <p style="color: #333; line-height: 1.6;">
            Welcome to the MFA Academy family! We're thrilled to have you join us on this learning journey.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Whether you're here for Forex trading mastery or Full-Stack engineering, you've made a great choice.
            Our curriculum is designed to take you from beginner to professional with hands-on projects,
            live sessions, and mentorship.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background: #C9A84C; color: #0A0F2C; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The MFA Academy Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send welcome email:', error);
  }
}

// Send enrollment confirmation (payment success or free enrollment)
async function sendEnrollmentConfirmation(user, course) {
  if (!transporter) {
    console.warn('[Email Service] Skipping enrollment confirmation - SMTP not configured');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFA Platform" <noreply@mfaacademy.com>',
      to: user.email,
      subject: 'Enrollment Confirmed! 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A0F2C, #1a1f3c); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #F5F5F0; margin: 0;">Enrollment Confirmed!</h1>
            <p style="color: #F5F5F0; opacity: 0.8; margin: 10px 0 0 0;">You're now enrolled</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Hi ${user.full_name},
          </p>
          <p style="color: #333; line-height: 1.6;">
            Congratulations! You've been successfully enrolled in:
          </p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C9A84C;">
            <h2 style="color: #0A0F2C; margin: 0 0 10px 0;">${course.title}</h2>
            <p style="color: #666; margin: 0;">${course.academy === 'tech' ? 'Tech Academy' : 'Forex Academy'}</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            You now have full access to all course materials, including:
          </p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Video lessons and tutorials</li>
            <li>Downloadable resources and PDFs</li>
            <li>Live class sessions (when scheduled)</li>
            <li>Community chat access</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/courses/${course.id}" 
               style="background: #C9A84C; color: #0A0F2C; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Learning
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The MFA Academy Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Enrollment confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send enrollment confirmation:', error);
  }
}

// Send batch approval email
async function sendBatchApprovalEmail(user, batch) {
  if (!transporter) {
    console.warn('[Email Service] Skipping batch approval email - SMTP not configured');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFA Platform" <noreply@mfaacademy.com>',
      to: user.email,
      subject: 'Application Approved! 🌟',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2ECC71, #27ae60); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0;">Application Approved!</h1>
            <p style="color: #fff; opacity: 0.9; margin: 10px 0 0 0;">Welcome to the cohort</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Hi ${user.full_name},
          </p>
          <p style="color: #333; line-height: 1.6;">
            Great news! Your application for the mentorship batch has been approved.
          </p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2ECC71;">
            <h2 style="color: #0A0F2C; margin: 0 0 10px 0;">${batch.name}</h2>
            <p style="color: #666; margin: 0;">${batch.academy === 'tech' ? 'Tech Academy' : 'Forex Academy'}</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            You now have access to:
          </p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Exclusive mentorship sessions</li>
            <li>Batch group chat with fellow cohort members</li>
            <li>Personalized guidance and feedback</li>
            <li>Priority support</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background: #2ECC71; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The MFA Academy Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Batch approval email sent to ${user.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send batch approval email:', error);
  }
}

// Send batch rejection email
async function sendBatchRejectionEmail(user, batch) {
  if (!transporter) {
    console.warn('[Email Service] Skipping batch rejection email - SMTP not configured');
    return;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFA Platform" <noreply@mfaacademy.com>',
      to: user.email,
      subject: 'Application Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #E74C3C, #c0392b); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0;">Application Update</h1>
            <p style="color: #fff; opacity: 0.9; margin: 10px 0 0 0;">Regarding your application</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Hi ${user.full_name},
          </p>
          <p style="color: #333; line-height: 1.6;">
            Thank you for your interest in our mentorship program. After careful review of your application,
            we regret to inform you that we are unable to accept you into this cohort at this time.
          </p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E74C3C;">
            <h2 style="color: #0A0F2C; margin: 0 0 10px 0;">${batch.name}</h2>
            <p style="color: #666; margin: 0;">${batch.academy === 'tech' ? 'Tech Academy' : 'Forex Academy'}</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            This decision is not a reflection of your potential. We encourage you to apply for future cohorts
            and continue building your skills through our regular courses.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background: #0A0F2C; color: #F5F5F0; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Explore Other Courses
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The MFA Academy Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Batch rejection email sent to ${user.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send batch rejection email:', error);
  }
}

// Send class reminder (24 hours before live session)
async function sendClassReminder(user, session) {
  if (!transporter) {
    console.warn('[Email Service] Skipping class reminder - SMTP not configured');
    return;
  }

  try {
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MFA Platform" <noreply@mfaacademy.com>',
      to: user.email,
      subject: 'Reminder: Live Class Tomorrow 📅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00CFFF, #0099cc); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #0A0F2C; margin: 0;">Class Reminder</h1>
            <p style="color: #0A0F2C; opacity: 0.8; margin: 10px 0 0 0;">See you tomorrow!</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Hi ${user.full_name},
          </p>
          <p style="color: #333; line-height: 1.6;">
            This is a friendly reminder that you have a live class scheduled for tomorrow.
          </p>
          <div style="background: #f5f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00CFFF;">
            <h2 style="color: #0A0F2C; margin: 0 0 10px 0;">${session.title}</h2>
            <p style="color: #666; margin: 0;">
              📅 ${formattedDate}<br>
              ⏰ ${formattedTime}<br>
              ⏱️ Duration: ${session.duration_mins} minutes
            </p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Make sure to:
          </p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Test your internet connection beforehand</li>
            <li>Have your questions ready</li>
            <li>Join 5-10 minutes early to settle in</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/sessions" 
               style="background: #00CFFF; color: #0A0F2C; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Session Details
            </a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The MFA Academy Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Class reminder sent to ${user.email}`);
  } catch (error) {
    console.error('[Email Service] Failed to send class reminder:', error);
  }
}

// Initialize on module load
initTransporter();

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentConfirmation,
  sendBatchApprovalEmail,
  sendBatchRejectionEmail,
  sendClassReminder,
};
