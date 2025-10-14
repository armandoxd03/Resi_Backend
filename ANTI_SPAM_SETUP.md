# Email Anti-Spam Configuration for ResiLinked

This guide will help you configure your email settings to prevent verification emails from going to spam folders.

## Generate DKIM Keys

1. Run the DKIM key generator script:
```bash
node generate-dkim-keys.js
```

2. This will create a folder called `dkim-keys` with the following files:
   - `dkim-private.pem`: Your private DKIM key
   - `dkim-public.pem`: Your public DKIM key
   - `dkim-dns-record.txt`: The TXT record to add to your DNS
   - `dkim-env-snippet.txt`: The configuration to add to your .env file

3. Add the contents of `dkim-env-snippet.txt` to your `.env` file, replacing `your-domain.com` with your actual domain name.

## DNS Configuration

### 1. Add the DKIM Record

Create a TXT record in your DNS settings:
- **Name**: `email._domainkey.yourdomain.com` (replace yourdomain.com with your actual domain)
- **Value**: The content of `dkim-dns-record.txt`

### 2. Add SPF Record

Create a TXT record for SPF:
- **Name**: `@` (or empty, depending on your DNS provider)
- **Value**: `v=spf1 include:_spf.google.com include:sendgrid.net ~all`

### 3. Add DMARC Record

Create a TXT record for DMARC:
- **Name**: `_dmarc.yourdomain.com`
- **Value**: `v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; pct=100; adkim=r; aspf=r`

## Testing Your Configuration

After setting up, send a test email and check the headers to verify that DKIM, SPF, and DMARC are passing.

You can use tools like:
- [Mail Tester](https://www.mail-tester.com/)
- [MX Toolbox](https://mxtoolbox.com/dkim.aspx)

## If Emails Still Go to Spam

1. Make sure your IP is not blacklisted
2. Improve your email content (avoid spam trigger words)
3. Set up proper email authentication records
4. Send emails consistently from the same address
5. Include proper unsubscribe links