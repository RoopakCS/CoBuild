# Load environment variables from .env file and run Spring Boot
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

Write-Host "Environment variables loaded from .env" -ForegroundColor Green
Write-Host "DB_URL = $env:DB_URL" -ForegroundColor Cyan

mvn spring-boot:run
