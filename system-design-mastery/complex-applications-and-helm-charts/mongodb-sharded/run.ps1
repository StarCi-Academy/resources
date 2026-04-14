# Script triển khai MongoDB Sharded cluster bằng Helm (Bitnami Legacy images)
# (EN: Script to deploy MongoDB Sharded cluster using Helm — Bitnami Legacy images)

# Tên release và namespace (EN: release name and namespace)
$RELEASE_NAME = "mongodb-sharded"
$NAMESPACE = "database"

# Tạo namespace nếu chưa tồn tại (EN: create namespace if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Triển khai MongoDB Sharded với values.yaml chứa bitnamilegacy images
# (EN: deploy MongoDB Sharded with values.yaml containing bitnamilegacy images)
helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/mongodb-sharded `
  --namespace $NAMESPACE `
  --values values.yaml `
  --wait

# Hiển thị trạng thái sau khi deploy (EN: show status after deployment)
Write-Host ""
Write-Host "=== MongoDB Sharded Cluster Status ==="
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE_NAME

# Hướng dẫn kết nối (EN: connection instructions)
Write-Host ""
Write-Host "=== Kết nối / Connection ==="
Write-Host "Mongos endpoint: $RELEASE_NAME-mongodb-sharded.$NAMESPACE.svc.cluster.local:27017"
Write-Host "Root password: root123"

# Run command:
# .\run.ps1
