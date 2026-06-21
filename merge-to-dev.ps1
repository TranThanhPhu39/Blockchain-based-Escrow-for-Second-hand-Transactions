# ============================================================
# merge-to-dev.ps1
#
# Purpose: Merge latest backend (feature/auth-escrow) and frontend UI
# (frontend-1, currently at ROOT of that branch) into `dev` branch,
# following monorepo structure (backend/ + frontend/).
#
# RUN THIS FROM THE REPO ROOT (where .git lives)
#
# Assumptions:
# - You are currently on feature/auth-escrow locally (with latest
#   backend fixes: event listener polling, escrowIdOnChain, etc.)
# - frontend-1 and dev branches are NOT yet local, only on remote (GitHub)
#
# After running, local `dev` branch will have:
#   dev/backend/   <- taken from feature/auth-escrow (overwritten)
#   dev/frontend/src, frontend/public, frontend/index.html, ...
#                  <- taken from frontend-1, copied into frontend/
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==> Step 0: Checking current directory has .git" -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: .git not found in current directory. cd into repo root first." -ForegroundColor Red
    exit 1
}

Write-Host "==> Step 1: Commit current backend changes on feature/auth-escrow (if any)" -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "   Current branch: $currentBranch"

$status = git status --porcelain
if ($status) {
    Write-Host "   Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Fix: event listener polling (queryFilter + lastProcessedBlock), escrowIdOnChain eager-set in createEscrow"
} else {
    Write-Host "   No changes to commit." -ForegroundColor Green
}

Write-Host "==> Step 2: Push feature/auth-escrow to GitHub (backup)" -ForegroundColor Cyan
git push origin feature/auth-escrow

Write-Host "==> Step 3: Fetch and checkout dev branch" -ForegroundColor Cyan
git fetch origin

$devExists = git branch --list dev
if (-not $devExists) {
    git checkout -b dev origin/dev
} else {
    git checkout dev
    git pull origin dev
}

Write-Host "==> Step 4: Copy latest backend/ from feature/auth-escrow into dev" -ForegroundColor Cyan
git checkout feature/auth-escrow -- backend

Write-Host "==> Step 5: Copy frontend (currently at ROOT of frontend-1) into dev/frontend/" -ForegroundColor Cyan
# frontend-1 keeps all code at ROOT (src/, public/, index.html, package.json, ...)
# while dev needs it inside frontend/. Different folder structure, so we
# cannot simply git checkout frontend-1 -- src (would create root-level ./src).
# Instead: use git worktree to get a temp checkout of frontend-1, then copy
# the needed parts into frontend/.

$tempDir = "..\frontend1_temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

Write-Host "   Creating temp worktree for frontend-1 at $tempDir ..." -ForegroundColor Yellow
git worktree add $tempDir frontend-1

if (-not (Test-Path $tempDir)) {
    Write-Host "ERROR: git worktree failed. Trying fallback clone..." -ForegroundColor Red
    $originUrl = git remote get-url origin
    git clone --branch frontend-1 --single-branch $originUrl $tempDir
}

# List of files/folders to copy from frontend-1 root.
# Adjust this list if frontend-1 has other files (e.g. vite.config.js, .env.example, etc.)
$itemsToCopy = @(
    "src",
    "public",
    "index.html",
    "package.json",
    "package-lock.json",
    "tailwind.config.js",
    "postcss.config.js",
    "vite.config.js"
)

Write-Host "   Copying frontend items into dev/frontend/ ..." -ForegroundColor Yellow
foreach ($item in $itemsToCopy) {
    $sourcePath = Join-Path $tempDir $item
    $destPath = Join-Path "frontend" $item

    if (Test-Path $sourcePath) {
        if (Test-Path $destPath) {
            Remove-Item $destPath -Recurse -Force
        }
        Copy-Item $sourcePath $destPath -Recurse -Force
        Write-Host "      OK: copied $item" -ForegroundColor Green
    } else {
        Write-Host "      SKIP: '$item' not found in frontend-1" -ForegroundColor DarkYellow
    }
}

Write-Host "==> Step 6: Clean up temp worktree" -ForegroundColor Cyan
git worktree remove $tempDir --force
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

Write-Host "==> Step 7: Review changes before commit" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host " REVIEW 'git status' AND THE 'frontend/' FOLDER CONTENT ABOVE " -ForegroundColor Magenta
Write-Host " before running these commands to finish:" -ForegroundColor Magenta
Write-Host ""
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Merge backend fixes and frontend-1 UI into dev'" -ForegroundColor White
Write-Host "   git push origin dev" -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Magenta