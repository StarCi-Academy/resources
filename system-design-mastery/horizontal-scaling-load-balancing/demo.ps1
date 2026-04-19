# Horizontal Scaling & Load Balancing — Demo (3 backend path-routed, PowerShell)

param(
    [Parameter(Position = 0)]
    [ValidateSet('apply', 'data', 'rr', 'scale', 'failover', 'all', 'clean')]
    [string]$Action = 'all'
)

$ErrorActionPreference = 'Stop'

$LbIp    = if ($env:LB_IP)       { $env:LB_IP }       else { $null }
$HostHdr = if ($env:HOST_HEADER) { $env:HOST_HEADER } else { 'hsl.example.com' }

if (-not $LbIp -and $Action -notin @('apply', 'clean')) {
    Write-Host "LB_IP chưa set. Lấy external IP: kubectl get svc -n ingress-nginx" -ForegroundColor Yellow
    Write-Host "Rồi: `$env:LB_IP='<ip>'; .\demo.ps1 $Action"
    exit 1
}

function Log($m)  { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Note($m) { Write-Host "    $m"   -ForegroundColor Yellow }
function Ok($m)   { Write-Host "    [OK] $m" -ForegroundColor Green }

# Gọi DO LB kèm Host header (EN: call DO LB with Host header)
function Call($path) {
    Invoke-RestMethod -Uri "http://${LbIp}${path}" -Headers @{ Host = $HostHdr }
}

function Invoke-Apply {
    Log 'Apply 3 Deployment + Service + Ingress'
    kubectl apply -f users-app-deployment.yaml
    kubectl apply -f orders-app-deployment.yaml
    kubectl apply -f products-app-deployment.yaml
    kubectl apply -f backend-ingress.yaml
    kubectl rollout status deploy/users-app    --timeout=120s
    kubectl rollout status deploy/orders-app   --timeout=120s
    kubectl rollout status deploy/products-app --timeout=120s
    Ok '3 backend sẵn sàng'
    kubectl get pods -l 'app in (users-app,orders-app,products-app)' -o wide
}

function Invoke-Data {
    Log '[Data] 3 path → 3 dataset khác nhau (Ingress L7)'
    Note 'GET /api/users';    Call '/api/users'    | ConvertTo-Json -Depth 4
    Note 'GET /api/orders';   Call '/api/orders'   | ConvertTo-Json -Depth 4
    Note 'GET /api/products'; Call '/api/products' | ConvertTo-Json -Depth 4
    Ok 'Một public IP phục vụ cả 3 backend — sức mạnh L7 routing'
}

function Invoke-Rr {
    Log '[Round-Robin] Bên trong từng service'
    foreach ($path in '/api/users/whoami', '/api/orders/whoami', '/api/products/whoami') {
        Note "6 request → $path"
        1..6 | ForEach-Object {
            $r = Call $path
            Write-Host "    $($r.service) -> $($r.pod)"
        }
    }
    Ok 'Mỗi service round-robin độc lập trong pool riêng'
}

function Invoke-Scale {
    Log '[Scale] users-app 3 -> 6'
    kubectl scale deploy/users-app --replicas=6
    kubectl rollout status deploy/users-app --timeout=120s
    Note '12 request /api/users/whoami'
    1..12 | ForEach-Object { Write-Host "    $((Call '/api/users/whoami').pod)" }

    Log '[Scale] users-app 6 -> 1'
    kubectl scale deploy/users-app --replicas=1
    kubectl rollout status deploy/users-app --timeout=120s
    Note '5 request đều 1 pod'
    1..5 | ForEach-Object { Write-Host "    $((Call '/api/users/whoami').pod)" }
    Ok 'Scale một service không ảnh hưởng 2 service còn lại'
}

function Invoke-Failover {
    Log '[Fail-Over] Kill 1 pod orders-app'
    kubectl scale deploy/orders-app --replicas=3
    kubectl rollout status deploy/orders-app --timeout=120s

    $victim = kubectl get pods -l app=orders-app -o jsonpath='{.items[0].metadata.name}'
    Note "Xoá pod: $victim"
    kubectl delete pod $victim --wait=false

    Note 'Bắn 15 request /api/orders/whoami'
    1..15 | ForEach-Object {
        try { Write-Host "    $((Call '/api/orders/whoami').pod)" }
        catch { Write-Host '    (lỗi)' -ForegroundColor Red }
        Start-Sleep -Milliseconds 200
    }
    Ok 'Không 5xx kéo dài — fail-over nhờ readinessProbe + Ingress'
}

function Invoke-Clean {
    Log 'Xoá manifest'
    kubectl delete --ignore-not-found=true `
        -f backend-ingress.yaml `
        -f users-app-deployment.yaml `
        -f orders-app-deployment.yaml `
        -f products-app-deployment.yaml
    Ok 'Dọn sạch'
}

switch ($Action) {
    'apply'    { Invoke-Apply }
    'data'     { Invoke-Data }
    'rr'       { Invoke-Rr }
    'scale'    { Invoke-Scale }
    'failover' { Invoke-Failover }
    'all'      { Invoke-Apply; Invoke-Data; Invoke-Rr; Invoke-Scale; Invoke-Failover }
    'clean'    { Invoke-Clean }
}
