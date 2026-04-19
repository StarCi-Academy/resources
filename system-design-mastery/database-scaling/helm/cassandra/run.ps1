# Triển khai Cassandra (Bitnami chart + bitnamilegacy images)
# (EN: Deploy Cassandra — Bitnami chart + bitnamilegacy images)

$RELEASE_NAME = "cassandra"
$NAMESPACE = "database"

kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/cassandra `
  --namespace $NAMESPACE `
  --values values.yaml `
  --wait

Write-Host ""
Write-Host "=== Cassandra Status ==="
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE_NAME

Write-Host ""
Write-Host "=== Kết nối / Connection ==="
Write-Host "Headless seeds: $RELEASE_NAME-headless.$NAMESPACE.svc.cluster.local:9042"
Write-Host "User: cassandra / Password: cassandra123"

# Run command:
# .\run.ps1
