# Start Next.js dev server with error capture
Write-Host "Starting Next.js dev server on port 3001..." -ForegroundColor Cyan
Write-Host ""

$env:NODE_ENV = "development"

# Run Next.js and capture all output
npx next dev --port 3001

# If we get here, the server exited
Write-Host ""
Write-Host "Server exited. Press any key to continue..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

