# A lancer depuis le dossier qui contient index.html
# Cree ./vendor/ et telecharge les dependances locales necessaires a CodeFlow offline.

$ErrorActionPreference = "Stop"

function Download-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,

        [Parameter(Mandatory = $true)]
        [string]$OutputPath
    )

    $directory = Split-Path -Parent $OutputPath
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }

    Write-Host "Download: $Url"
    Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
}

New-Item -ItemType Directory -Force -Path "vendor" | Out-Null
New-Item -ItemType Directory -Force -Path "vendor\web-tree-sitter" | Out-Null
New-Item -ItemType Directory -Force -Path "vendor\tree-sitter-wasms\out" | Out-Null

# Librairies JS principales
Download-File "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js" "vendor\react.production.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js" "vendor\react-dom.production.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js" "vendor\babel.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js" "vendor\d3.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/d3-sankey/0.12.3/d3-sankey.min.js" "vendor\d3-sankey.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/acorn/8.11.3/acorn.min.js" "vendor\acorn.min.js"
Download-File "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" "vendor\jszip.min.js"

# Runtime web-tree-sitter 0.20.8
Download-File "https://cdn.jsdelivr.net/npm/web-tree-sitter@0.20.8/tree-sitter.js" "vendor\web-tree-sitter\tree-sitter.js"
Download-File "https://cdn.jsdelivr.net/npm/web-tree-sitter@0.20.8/tree-sitter.wasm" "vendor\web-tree-sitter\tree-sitter.wasm"

# Copies de compatibilite si index.html garde ./vendor/tree-sitter.js
Copy-Item "vendor\web-tree-sitter\tree-sitter.js" "vendor\tree-sitter.js" -Force
Copy-Item "vendor\web-tree-sitter\tree-sitter.wasm" "vendor\tree-sitter.wasm" -Force

# Grammaires WASM appelees par Parser.treeSitterGrammars
$languages = @(
    "python",
    "javascript",
    "typescript",
    "tsx",
    "go",
    "rust",
    "java",
    "ruby",
    "php",
    "c",
    "cpp",
    "c_sharp",
    "swift",
    "kotlin",
    "scala",
    "elixir",
    "lua",
    "bash"
)

foreach ($lang in $languages) {
    Download-File "https://cdn.jsdelivr.net/npm/tree-sitter-wasms@0.1.13/out/tree-sitter-$lang.wasm" "vendor\tree-sitter-wasms\out\tree-sitter-$lang.wasm"
}

Write-Host ""
Write-Host "Vendor offline pret." -ForegroundColor Green
Write-Host "Lance ensuite : python -m http.server 8080"
Write-Host "Puis ouvre     : http://127.0.0.1:"