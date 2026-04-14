#!/bin/bash

# Script triển khai Cert-Manager bằng Helm (Bitnami Legacy images) cho DigitalOcean
# (EN: Script to deploy Cert-Manager using Helm — Bitnami Legacy images for DigitalOcean)

# Tên release và namespace (EN: release name and namespace)
RELEASE_NAME="cert-manager"
NAMESPACE="cert-manager"

# Tạo namespace nếu chưa tồn tại (EN: create namespace if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Triển khai Cert-Manager với values.yaml
# (EN: deploy Cert-Manager with values.yaml)
helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/cert-manager \
  --namespace $NAMESPACE \
  --values values.yaml \
  --wait

# Hiển thị trạng thái sau khi deploy (EN: show status after deployment)
echo ""
echo "=== Cert-Manager Pods ==="
kubectl get pods -n $NAMESPACE

# Kiểm tra CRDs đã được cài đặt (EN: verify CRDs are installed)
echo ""
echo "=== Cert-Manager CRDs ==="
kubectl get crds | grep cert-manager

# Run command:
# chmod +x run.sh && ./run.sh
