#!/bin/bash

# Script triển khai NGINX Ingress Controller bằng Helm (Bitnami Legacy images) cho DigitalOcean
# (EN: Script to deploy NGINX Ingress Controller using Helm — Bitnami Legacy images for DigitalOcean)

# Tên release và namespace (EN: release name and namespace)
RELEASE_NAME="nginx-ingress"
NAMESPACE="ingress-nginx"

# Tạo namespace nếu chưa tồn tại (EN: create namespace if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Triển khai NGINX Ingress Controller với values.yaml
# (EN: deploy NGINX Ingress Controller with values.yaml)
helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller \
  --namespace $NAMESPACE \
  --values values.yaml \
  --wait

# Hiển thị trạng thái sau khi deploy (EN: show status after deployment)
echo ""
echo "=== NGINX Ingress Controller Pods ==="
kubectl get pods -n $NAMESPACE

# Hiển thị Load Balancer External IP (EN: show Load Balancer External IP)
echo ""
echo "=== Load Balancer External IP ==="
kubectl get svc -n $NAMESPACE -o wide

# Run command:
# chmod +x run.sh && ./run.sh
