# Email Setup Instructions for ResiLinked

To prevent verification emails from going to spam folders, follow these setup instructions.

## DNS Configuration

### 1. SPF Records

Add the following SPF record to your domain's DNS settings:

```
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

This allows both Gmail and SendGrid to send emails on behalf of your domain.

### 2. DKIM Configuration

#### For SendGrid:

1. Log in to your SendGrid account
2. Navigate to Settings > Sender Authentication
3. Follow the instructions to set up domain authentication
4. Add the CNAME records provided by SendGrid to your domain's DNS settings

#### For Gmail:

If using Google Workspace:
1. Log in to your Google Workspace admin console
2. Go to Apps > Google Workspace > Gmail > Authenticate email
3. Follow the instructions to set up DKIM

### 3. DMARC Record

Add a DMARC record to your domain:

```
v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; pct=100; adkim=r; aspf=r
```

## Email Content Best Practices

1. **Use a consistent from address**: Always use the same FROM email address
2. **Include unsubscribe link**: Even for transactional emails
3. **Avoid spam trigger words**: Don't use excessive capitalization or words like "FREE"
4. **Keep HTML clean**: Use simple HTML with proper formatting
5. **Balance text to image ratio**: Don't rely too heavily on images

## Application Configuration

Update your .env file with these settings:

```
EMAIL_FROM=ResiLinked <notifications@yourdomain.com>
```

Make sure your domain matches the domain you've configured in the DNS records.

## Testing

After implementation, test your email deliverability with:

1. [Mail Tester](https://www.mail-tester.com/)
2. Send test emails to different email providers (Gmail, Outlook, Yahoo)
3. Check the authentication results in the email headers

## Troubleshooting

If emails are still going to spam:

1. Check email headers for failed authentication
2. Verify DNS records are properly configured
3. Ensure IP address is not blacklisted
4. Review email content for spam triggers