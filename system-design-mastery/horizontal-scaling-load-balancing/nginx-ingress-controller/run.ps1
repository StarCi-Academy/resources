# Triển khai NGINX Ingress Controller bằng Helm (Bitnami Legacy) cho DOKS — PowerShell
# (EN: Deploy NGINX Ingress Controller via Helm for DOKS — PowerShell)

$ErrorActionPreference = 'Stop'

$ReleaseName = 'nginx-ingress'
$Namespace   = 'ingress-nginx'

kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install $ReleaseName oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller `
  --namespace $Namespace `
  --values values.yaml `
  --wait

Write-Host "`n=== NGINX Ingress Controller Pods ==="
kubectl get pods -n $Namespace

Write-Host "`n=== DigitalOcean Load Balancer (external IP) ==="
kubectl get svc -n $Namespace -o wide
