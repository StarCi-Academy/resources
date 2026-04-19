#!/bin/bash
# Triển khai NGINX Ingress Controller bằng Helm (Bitnami Legacy) cho DOKS
# (EN: deploy NGINX Ingress Controller via Helm (Bitnami Legacy) for DOKS)

set -euo pipefail

RELEASE_NAME="nginx-ingress"
NAMESPACE="ingress-nginx"

# Tạo namespace nếu chưa có (EN: create namespace if missing)
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Cài / upgrade controller + chờ tới khi LoadBalancer có external IP
# (EN: install/upgrade controller; wait until the LoadBalancer has an external IP)
helm upgrade --install "$RELEASE_NAME" oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller \
  --namespace "$NAMESPACE" \
  --values values.yaml \
  --wait

echo ""
echo "=== NGINX Ingress Controller Pods ==="
kubectl get pods -n "$NAMESPACE"

echo ""
echo "=== DigitalOcean Load Balancer (external IP) ==="
kubectl get svc -n "$NAMESPACE" -o wide

# Run command:
# chmod +x run.sh && ./run.sh
