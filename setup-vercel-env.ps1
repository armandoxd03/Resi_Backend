# PowerShell Script to Set Up Vercel Environment Variables
# This script helps you configure all required environment variables in Vercel

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ResiLinked Backend - Vercel Environment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Alternative: Configure manually at https://vercel.com/dashboard" -ForegroundColor Blue
    exit 1
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Confirm project
Write-Host "📁 Current directory: $PWD" -ForegroundColor Blue
Write-Host ""
$confirm = Read-Host "Is this your Resi_Backend directory? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Please navigate to your Resi_Backend directory first" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔑 Setting up environment variables for Vercel..." -ForegroundColor Cyan
Write-Host ""

# List of environment variables from .env.vercel
$envVars = @{
    "NODE_ENV" = "production"
    "MONGODB_URI" = "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority"
    "JWT_SECRET" = "shd72shd8shd28hsd72js8shd"
    "EMAIL_HOST" = "smtp.gmail.com"
    "EMAIL_PORT" = "587"
    "EMAIL_SECURE" = "false"
    "EMAIL_USER" = "resilinked@gmail.com"
    "EMAIL_PASS" = "wbfcutjxqqkiqcvk"
    "EMAIL_FROM" = "ResiLinked <resilinked@gmail.com>"
    "FRONTEND_URL" = "https://resi-frontend.vercel.app,https://resilinked.vercel.app"
    "CORS_ORIGIN" = "https://resi-frontend.vercel.app,https://resilinked.vercel.app"
    "CORS_ENABLED" = "true"
    "RATE_LIMIT_WINDOW_MS" = "900000"
    "RATE_LIMIT_MAX_REQUESTS" = "100"
    "AUTH_RATE_LIMIT_MAX" = "5"
}

Write-Host "📋 Variables to be added:" -ForegroundColor Yellow
$envVars.Keys | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor Gray
}
Write-Host ""

$confirm = Read-Host "Proceed with adding these variables to Vercel? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Setup cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "⚙️ Adding environment variables..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Adding: $key..." -NoNewline
    
    try {
        # Add to production environment
        $output = vercel env add $key production --force 2>&1
        echo $value | vercel env add $key production --force 2>&1 | Out-Null
        
        Write-Host " ✅" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Successfully added: $successCount variables" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  ❌ Failed: $failCount variables" -ForegroundColor Red
}
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🚀 Environment variables configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Redeploy your application: vercel --prod" -ForegroundColor White
    Write-Host "  2. Check logs: vercel logs --follow" -ForegroundColor White
    Write-Host "  3. Test user registration" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "⚠️ No variables were added successfully" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Manual setup instructions:" -ForegroundColor Blue
    Write-Host "  1. Go to https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "  2. Select your backend project" -ForegroundColor White
    Write-Host "  3. Settings → Environment Variables" -ForegroundColor White
    Write-Host "  4. Add variables from .env.vercel file" -ForegroundColor White
    Write-Host ""
    Write-Host "See VERCEL_ENV_SETUP.md for detailed instructions" -ForegroundColor Blue
}
