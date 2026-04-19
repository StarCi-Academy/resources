#!/bin/bash

# Script triển khai PostgreSQL HA cluster bằng Helm (Bitnami Legacy images)
# (EN: Script to deploy PostgreSQL HA cluster using Helm — Bitnami Legacy images)

# Tên release và namespace (EN: release name and namespace)
RELEASE_NAME="postgresql-ha"
NAMESPACE="database"

# Tạo namespace nếu chưa tồn tại (EN: create namespace if not exists)
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Triển khai PostgreSQL HA với values.yaml chứa bitnamilegacy images
# (EN: deploy PostgreSQL HA with values.yaml containing bitnamilegacy images)
helm upgrade --install $RELEASE_NAME oci://registry-1.docker.io/bitnamicharts/postgresql-ha \
  --namespace $NAMESPACE \
  --values values.yaml \
  --wait

# Hiển thị trạng thái sau khi deploy (EN: show status after deployment)
echo ""
echo "=== PostgreSQL HA Cluster Status ==="
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/instance=$RELEASE_NAME

# Hướng dẫn kết nối (EN: connection instructions)
echo ""
echo "=== Kết nối / Connection ==="
echo "Pgpool endpoint: $RELEASE_NAME-pgpool.$NAMESPACE.svc.cluster.local:5432"
echo "Database: demo_db"
echo "Username: postgres"
echo "Password: postgres123"

# Run command:
# chmod +x run.sh && ./run.sh
