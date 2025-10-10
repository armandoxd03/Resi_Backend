# Email Configuration Guide

This guide will help you properly set up email sending functionality in the Resi application.

## Issue: 500 Internal Server Error on Registration

The application is experiencing a 500 Internal Server Error when registering users. This is caused by issues with the email verification system.

## Solution Options

You have two options to fix this issue:

### Option 1: Use SendGrid (Recommended for Production)

SendGrid is more reliable for sending emails from cloud hosting platforms like Render.

1. Sign up for a free SendGrid account at [SendGrid.com](https://sendgrid.com/)
2. Create an API key in your SendGrid dashboard
3. Update your `.env` file with the API key:
   ```
   SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
   EMAIL_FROM=ResiLinked <your-verified-sender@example.com>
   ```
4. Verify your sender email in the SendGrid dashboard

### Option 2: Fix Gmail Configuration

If you prefer using Gmail:

1. Make sure 2-Factor Authentication (2FA) is enabled on your Gmail account
2. Generate an App Password:
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Sign in with your Google account
   - Select "Mail" as the app and your device name
   - Click "Generate"
3. Update your `.env` file with the generated password:
   ```
   EMAIL_PASS=your-16-character-app-password
   ```

## Testing Email Configuration

Run the test script to verify your email configuration:

```
node test-email.js your-email@example.com
```

## Note About Render Hosting

Cloud platforms like Render often block outgoing SMTP connections to Gmail, which can cause timeouts. This is why SendGrid is the recommended option for production use.

## Need Further Help?

If you continue to experience issues, check the server logs for detailed error messages that can help identify the specific problem.

## Default Environment Configuration

Make sure your `.env` file contains these settings:

```
# Email Configuration
# -------------- SendGrid (Recommended for production) --------------
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=ResiLinked <noreply@resilinked.com>

# -------------- Gmail SMTP (Fallback) --------------
# Gmail SMTP settings (may experience timeouts in some hosting environments)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail_username@gmail.com
EMAIL_PASS=your_gmail_app_password
```