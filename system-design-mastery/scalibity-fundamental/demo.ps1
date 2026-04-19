# =============================================================================
#  Scalibity Fundamental — Demo script (PowerShell cho Windows)
#  (EN: PowerShell demo script for Windows users without WSL)
#
#  Usage:
#     .\demo.ps1 apply        # apply toàn bộ manifest
#     .\demo.ps1 stateless    # kịch bản 1: scale postgres-app
#     .\demo.ps1 stateful     # kịch bản 2: scale sqlite-app
#     .\demo.ps1 all          # apply → stateless → stateful
#     .\demo.ps1 clean        # xoá toàn bộ
# =============================================================================

param(
    [Parameter(Position = 0)]
    [ValidateSet('apply', 'stateless', 'stateful', 'all', 'clean')]
    [string]$Action = 'all'
)

$ErrorActionPreference = 'Stop'

# Host mà NodePort expose ra (EN: host where NodePort is reachable)
$Host_ = if ($env:HOST) { $env:HOST } else { 'localhost' }
$PostgresAppUrl = "http://${Host_}:30001"
$SqliteAppUrl   = "http://${Host_}:30002"

function Log($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Note($msg) { Write-Host "    $msg"   -ForegroundColor Yellow }
function Ok($msg)   { Write-Host "    [OK] $msg" -ForegroundColor Green }

function Invoke-Apply {
    Log 'Apply Postgres (Pod + Service)'
    kubectl apply -f postgres-pod.yaml
    kubectl apply -f postgres-service.yaml

    Log 'Apply postgres-app (Deployment + NodePort 30001)'
    kubectl apply -f postgres-app-deployment.yaml
    kubectl apply -f postgres-app-service.yaml

    Log 'Apply sqlite-app (Deployment + NodePort 30002)'
    kubectl apply -f sqlite-app-deployment.yaml
    kubectl apply -f sqlite-app-service.yaml

    Log 'Đợi tất cả pod Ready (EN: wait for Ready)'
    kubectl wait --for=condition=Ready pod/postgres-pod --timeout=120s
    kubectl rollout status deploy/postgres-app --timeout=120s
    kubectl rollout status deploy/sqlite-app   --timeout=120s
    Ok 'Cluster sẵn sàng'
    kubectl get pods -o wide
}

function Invoke-Stateless {
    Log '[Stateless] Scale postgres-app -> 5 replicas'
    kubectl scale deploy/postgres-app --replicas=5
    kubectl rollout status deploy/postgres-app --timeout=120s

    Note 'POST 6 notes qua Service NodePort'
    1..6 | ForEach-Object {
        # Ghi 6 note để nhiều pod cùng tham gia (EN: 6 writes spread across pods)
        $body = @{ content = "note-$_" } | ConvertTo-Json -Compress
        Invoke-RestMethod -Method Post -Uri "$PostgresAppUrl/notes" `
            -ContentType 'application/json' -Body $body | ConvertTo-Json -Compress | Write-Host
    }

    Log '[Stateless] GET /notes 3 lần — luôn cùng 1 danh sách'
    1..3 | ForEach-Object {
        $r = Invoke-RestMethod -Uri "$PostgresAppUrl/notes"
        Write-Host "    pod=$($r.pod) count=$($r.count)"
    }
    Ok 'Mọi pod đọc cùng Postgres → nhất quán'

    Log '[Stateless] Scale down về 1 — data vẫn còn'
    kubectl scale deploy/postgres-app --replicas=1
    kubectl rollout status deploy/postgres-app --timeout=60s
    $r = Invoke-RestMethod -Uri "$PostgresAppUrl/notes"
    Write-Host "    còn lại: pod=$($r.pod) count=$($r.count)"
    Ok 'Scale down không mất data'
}

function Invoke-Stateful {
    Log '[Stateful] Scale sqlite-app -> 3 replicas'
    kubectl scale deploy/sqlite-app --replicas=3
    kubectl rollout status deploy/sqlite-app --timeout=120s

    Note 'POST 9 notes — mỗi note rơi vào đúng 1 file SQLite'
    1..9 | ForEach-Object {
        $body = @{ content = "sqlite-$_" } | ConvertTo-Json -Compress
        Invoke-RestMethod -Method Post -Uri "$SqliteAppUrl/notes" `
            -ContentType 'application/json' -Body $body | ConvertTo-Json -Compress | Write-Host
    }

    Log '[Stateful] GET /notes 6 lần — count nhảy theo pod'
    1..6 | ForEach-Object {
        # Mỗi pod chỉ thấy file của chính nó (EN: each pod only sees its own file)
        $r = Invoke-RestMethod -Uri "$SqliteAppUrl/notes"
        Write-Host "    pod=$($r.pod) count=$($r.count)"
    }
    Ok 'Data phân mảnh theo pod — anti-pattern'

    Log '[Stateful] Scale down về 1 — 2 file notes.db biến mất'
    kubectl scale deploy/sqlite-app --replicas=1
    kubectl rollout status deploy/sqlite-app --timeout=60s
    $r = Invoke-RestMethod -Uri "$SqliteAppUrl/notes"
    Write-Host "    còn lại: pod=$($r.pod) count=$($r.count)"
    Ok 'Scale down = mất data — đó là stateful'
}

function Invoke-Clean {
    Log 'Xoá toàn bộ manifest'
    kubectl delete --ignore-not-found=true `
        -f sqlite-app-service.yaml `
        -f sqlite-app-deployment.yaml `
        -f postgres-app-service.yaml `
        -f postgres-app-deployment.yaml `
        -f postgres-service.yaml `
        -f postgres-pod.yaml
    Ok 'Dọn sạch'
}

switch ($Action) {
    'apply'     { Invoke-Apply }
    'stateless' { Invoke-Stateless }
    'stateful'  { Invoke-Stateful }
    'all'       { Invoke-Apply; Invoke-Stateless; Invoke-Stateful }
    'clean'     { Invoke-Clean }
}
