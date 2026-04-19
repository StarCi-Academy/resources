#!/bin/bash

# Triển khai Cassandra (Bitnami chart + bitnamilegacy images)
# (EN: Deploy Cassandra — Bitnami chart + bitnamilegacy images)

RELEASE_NAME="cassandra"
NAMESPACE="database"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install "$RELEASE_NAME" oci://registry-1.docker.io/bitnamicharts/cassandra \
  --namespace "$NAMESPACE" \
  --values values.yaml \
  --wait

echo ""
echo "=== Cassandra Status ==="
kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"

echo ""
echo "=== Kết nối / Connection ==="
echo "Headless seeds: $RELEASE_NAME-headless.$NAMESPACE.svc.cluster.local:9042"
echo "User: cassandra / Password: cassandra123"
echo ""
echo "Test (cqlsh trong pod): kubectl exec -it -n $NAMESPACE sts/$RELEASE_NAME -- cqlsh -u cassandra -p cassandra123"

# Run command:
# chmod +x run.sh && ./run.sh
