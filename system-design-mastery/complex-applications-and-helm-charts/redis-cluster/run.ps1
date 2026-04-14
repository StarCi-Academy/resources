# Script triển khai Redis Cluster bằng Helm (Bitnami Legacy images)
# (EN: Script to deploy Redis Cluster using Helm — Bitnami Legacy images)

# Tên release và namespace (EN: release name and namespace)
$RELEASE_NAME = "redis-cluster"
$NAMESPACE = "database"

# Tạo namespace nếu chưa tồn tại (EN: create namespace if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Triển khai Redis Cluster với values.yaml chứa bitnamilegacy images
# (EN: deploy Redis Cluster with values.yaml containing bitnamilegacy images)
helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/redis-cluster `
  --namespace $NAMESPACE `
  --values values.yaml `
  --wait

# Hiển thị trạng thái sau khi deploy (EN: show status after deployment)
Write-Host ""
Write-Host "=== Redis Cluster Status ==="
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE_NAME

# Hướng dẫn kết nối (EN: connection instructions)
Write-Host ""
Write-Host "=== Kết nối / Connection ==="
Write-Host "Redis endpoint: $RELEASE_NAME.$NAMESPACE.svc.cluster.local:6379"
Write-Host "Password: redis123"
Write-Host ""
Write-Host "Test với redis-cli (EN: test with redis-cli):"
Write-Host "redis-cli -h $RELEASE_NAME.$NAMESPACE.svc.cluster.local -a redis123 cluster info"

# Run command:
# .\run.ps1
