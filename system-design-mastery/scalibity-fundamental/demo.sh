#!/usr/bin/env bash
# =============================================================================
#  Scalibity Fundamental — Demo script (stateful vs stateless trên Kubernetes)
#  (EN: Scalibity Fundamental — demo script: stateful vs stateless on K8s)
#
#  Yêu cầu: kubectl đã nối tới cluster (minikube/kind/Docker Desktop).
#  Images đã có sẵn trên registry (starci183/scalibity-postgres-app:latest,
#  starci183/scalibity-sqlite-app:latest) hoặc đã được load vào cluster.
#  (EN: Requires kubectl pointing at a cluster and both images available.)
#
#  Usage:
#     bash demo.sh apply        # apply toàn bộ manifest (EN: apply all manifests)
#     bash demo.sh stateless    # kịch bản 1: scale postgres-app → nhất quán
#     bash demo.sh stateful     # kịch bản 2: scale sqlite-app  → phân mảnh
#     bash demo.sh all          # chạy lần lượt apply → stateless → stateful
#     bash demo.sh clean        # xoá toàn bộ tài nguyên
# =============================================================================

set -euo pipefail

# Host mà NodePort expose ra (EN: host where NodePort is reachable)
HOST="${HOST:-localhost}"
POSTGRES_APP_URL="http://${HOST}:30001"
SQLITE_APP_URL="http://${HOST}:30002"

# Màu cho log (EN: log colors)
C_RESET="\033[0m"; C_CYAN="\033[36m"; C_YELLOW="\033[33m"; C_GREEN="\033[32m"

log() {
  # In banner cho từng bước demo (EN: print a banner per demo step)
  echo -e "\n${C_CYAN}==> $*${C_RESET}"
}

note() { echo -e "${C_YELLOW}    $*${C_RESET}"; }
ok()   { echo -e "${C_GREEN}    ✓ $*${C_RESET}"; }

# -----------------------------------------------------------------------------
# apply — triển khai toàn bộ (EN: deploy everything)
# -----------------------------------------------------------------------------
cmd_apply() {
  log "Apply Postgres (Pod + Service)"
  kubectl apply -f postgres-pod.yaml
  kubectl apply -f postgres-service.yaml

  log "Apply postgres-app (Deployment + NodePort 30001)"
  kubectl apply -f postgres-app-deployment.yaml
  kubectl apply -f postgres-app-service.yaml

  log "Apply sqlite-app (Deployment + NodePort 30002)"
  kubectl apply -f sqlite-app-deployment.yaml
  kubectl apply -f sqlite-app-service.yaml

  log "Đợi tất cả pod Ready (EN: wait for all pods Ready)"
  kubectl wait --for=condition=Ready pod/postgres-pod --timeout=120s
  kubectl rollout status deploy/postgres-app --timeout=120s
  kubectl rollout status deploy/sqlite-app   --timeout=120s
  ok "Cluster sẵn sàng (EN: cluster ready)"
  kubectl get pods -o wide
}

# -----------------------------------------------------------------------------
# stateless — scale postgres-app lên 5, chứng minh mọi pod đọc chung Postgres
# (EN: scale postgres-app to 5, prove every pod reads the shared Postgres)
# -----------------------------------------------------------------------------
cmd_stateless() {
  log "[Stateless] Scale postgres-app → 5 replicas"
  kubectl scale deploy/postgres-app --replicas=5
  kubectl rollout status deploy/postgres-app --timeout=120s

  note "POST 6 notes qua Service NodePort → Service round-robin qua 5 pod"
  # Gửi 6 POST để tăng xác suất có nhiều pod khác nhau cùng ghi
  # (EN: 6 POSTs so multiple pods likely receive writes)
  for i in 1 2 3 4 5 6; do
    curl -s -X POST "${POSTGRES_APP_URL}/notes" \
      -H "Content-Type: application/json" \
      -d "{\"content\":\"note-${i}\"}"
    echo
  done

  log "[Stateless] GET /notes từ nhiều request — tất cả cùng 1 danh sách"
  for i in 1 2 3; do
    # Mọi lần gọi đều trả count=6, dù Service route tới pod khác nhau
    # (EN: every call returns count=6 even when routed to different pods)
    curl -s "${POSTGRES_APP_URL}/notes" | sed 's/,/,\n  /g' | head -5
    echo "    ---"
  done
  ok "Mọi pod đọc cùng một Postgres → state nhất quán (EN: shared DB → consistent)"

  log "[Stateless] Scale down về 1 — data vẫn còn"
  kubectl scale deploy/postgres-app --replicas=1
  kubectl rollout status deploy/postgres-app --timeout=60s
  curl -s "${POSTGRES_APP_URL}/notes" | sed 's/,/,\n  /g' | head -5
  ok "Scale down không mất data — state nằm ở Postgres (EN: state lives in Postgres)"
}

# -----------------------------------------------------------------------------
# stateful — scale sqlite-app lên 3, chứng minh mỗi pod giữ state riêng
# (EN: scale sqlite-app to 3, prove each pod keeps its own state)
# -----------------------------------------------------------------------------
cmd_stateful() {
  log "[Stateful] Scale sqlite-app → 3 replicas"
  kubectl scale deploy/sqlite-app --replicas=3
  kubectl rollout status deploy/sqlite-app --timeout=120s

  note "POST 9 notes — mỗi note rơi vào đúng 1 pod (đúng 1 file SQLite)"
  for i in $(seq 1 9); do
    curl -s -X POST "${SQLITE_APP_URL}/notes" \
      -H "Content-Type: application/json" \
      -d "{\"content\":\"sqlite-${i}\"}"
    echo
  done

  log "[Stateful] GET /notes 6 lần — count nhảy loạn theo pod phục vụ"
  for i in 1 2 3 4 5 6; do
    # count sẽ khác nhau giữa các lần vì mỗi pod chỉ thấy file SQLite của chính nó
    # (EN: count differs per call because each pod only sees its own SQLite file)
    curl -s "${SQLITE_APP_URL}/notes" \
      | sed -E 's/.*"pod":"([^"]+)".*"count":([0-9]+).*/    pod=\1 count=\2/'
  done
  ok "Data phân mảnh theo pod (EN: data fragmented per pod) — anti-pattern đúng điệu"

  log "[Stateful] Scale down về 1 — 2 pod biến mất kéo theo 2 file notes.db"
  kubectl scale deploy/sqlite-app --replicas=1
  kubectl rollout status deploy/sqlite-app --timeout=60s
  curl -s "${SQLITE_APP_URL}/notes" \
    | sed -E 's/.*"pod":"([^"]+)".*"count":([0-9]+).*/    còn lại: pod=\1 count=\2/'
  ok "Scale down = mất data (EN: scale-down = data loss) — đó là stateful"
}

# -----------------------------------------------------------------------------
# clean — gỡ toàn bộ (EN: tear everything down)
# -----------------------------------------------------------------------------
cmd_clean() {
  log "Xoá toàn bộ manifest (EN: delete all manifests)"
  kubectl delete --ignore-not-found=true \
    -f sqlite-app-service.yaml \
    -f sqlite-app-deployment.yaml \
    -f postgres-app-service.yaml \
    -f postgres-app-deployment.yaml \
    -f postgres-service.yaml \
    -f postgres-pod.yaml
  ok "Dọn sạch (EN: clean)"
}

# -----------------------------------------------------------------------------
# Entry
# -----------------------------------------------------------------------------
case "${1:-}" in
  apply)     cmd_apply ;;
  stateless) cmd_stateless ;;
  stateful)  cmd_stateful ;;
  all)       cmd_apply; cmd_stateless; cmd_stateful ;;
  clean)     cmd_clean ;;
  *)
    echo "Usage: bash demo.sh {apply|stateless|stateful|all|clean}"
    exit 1
    ;;
esac
