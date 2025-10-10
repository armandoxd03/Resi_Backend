# Setting Up a New Gmail Account for Your Application

This guide will walk you through the process of setting up a new Gmail account and configuring it to work with your ResiLinked application.

## Step 1: Create a New Gmail Account

1. Visit [Gmail's signup page](https://accounts.google.com/signup)
2. Fill out the required information to create a new account
3. Complete the signup process and verify your account

## Step 2: Enable "Less Secure Apps" or Set Up App Password

Since you're using this account for SMTP purposes, you need to configure it to allow your application to send emails:

### Option 1: Enable 2-Factor Authentication and Use an App Password (Recommended)

1. Sign in to your new Gmail account
2. Go to [Google Account settings](https://myaccount.google.com/)
3. Click on "Security" in the left navigation
4. Under "Signing in to Google," find and enable "2-Step Verification"
5. After setting up 2FA, go back to the Security page
6. Look for "App passwords" (you'll only see this if 2-Step Verification is enabled)
7. Select "Mail" as the app and "Other" as the device
8. Enter a name for the app (e.g., "ResiLinked Backend")
9. Click "Generate"
10. Google will display a 16-character app password - copy this password
11. Use this password in your `.env` file (not your regular Gmail password)

### Option 2: Allow Less Secure Apps (Not Recommended for Production)

1. Sign in to your new Gmail account
2. Go to [Less secure app access](https://myaccount.google.com/lesssecureapps)
3. Turn on "Allow less secure apps"

Note: This option is less secure and Google may discontinue it in the future.

## Step 3: Update Your Environment Variables

Update your `.env` file with the following variables:

```
# Email Configuration
EMAIL_USER=your-new-gmail@gmail.com
EMAIL_PASS=your-app-password-or-gmail-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=ResiLinked <your-new-gmail@gmail.com>
```

## Step 4: Test the Email Configuration

Run the test script to verify your email setup:

```
node test-gmail.js your-test-recipient@example.com
```

Replace `your-test-recipient@example.com` with your personal email address to receive the test email.

## Step 5: Implement the Changes

After confirming that emails are being sent successfully:

1. Replace your current mailer.js file with the new version:

```
copy utils\mailer.js.new utils\mailer.js
```

2. Restart your application:

```
node app.js
```

## Troubleshooting

If you encounter issues:

1. Verify your Gmail credentials are correct
2. Check if you're using an App Password (if 2FA is enabled)
3. Make sure your Gmail account doesn't have any security blocks
4. Check Gmail's sent folder to see if emails are being sent but not delivered
5. Verify that your recipient's email isn't marked as spam

## Gmail Sending Limits

Be aware that Gmail has sending limits:
- 500 emails per day for regular Gmail accounts
- 2,000 emails per day for Google Workspace accounts

For production applications with high email volume, consider:
- Upgrading to Google Workspace
- Using a dedicated email service like SendGrid, Mailgun, or Amazon SES