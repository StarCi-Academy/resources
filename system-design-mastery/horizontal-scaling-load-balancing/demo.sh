#!/usr/bin/env bash
# =============================================================================
#  Horizontal Scaling & Load Balancing — Demo (3 backend path-routed)
#
#  Kịch bản (EN: scenarios):
#   1. data      — gọi 3 path, thấy dataset khác nhau trả về
#   2. rr        — round-robin trong từng service, in pod name
#   3. scale     — scale riêng users-app 3→6→1, quan sát phân tán
#   4. failover  — kill 1 pod orders-app, Ingress tự bỏ qua trong vài giây
#
#  Yêu cầu (EN: requires): kubectl nối DOKS; Ingress Controller + DO LB đã cài.
#  Usage:
#     LB_IP=<do-lb-ip> bash demo.sh {apply|data|rr|scale|failover|all|clean}
# =============================================================================

set -euo pipefail

LB_IP="${LB_IP:-}"
HOST_HEADER="${HOST_HEADER:-hsl.example.com}"

if [[ -z "$LB_IP" && "${1:-}" != "apply" && "${1:-}" != "clean" ]]; then
  echo "LB_IP chưa set. Lấy external IP: kubectl get svc -n ingress-nginx"
  echo "Rồi: LB_IP=<ip> bash demo.sh $1"
  exit 1
fi

C_CYAN="\033[36m"; C_YELLOW="\033[33m"; C_GREEN="\033[32m"; C_RESET="\033[0m"
log()  { echo -e "\n${C_CYAN}==> $*${C_RESET}"; }
note() { echo -e "${C_YELLOW}    $*${C_RESET}"; }
ok()   { echo -e "${C_GREEN}    ✓ $*${C_RESET}"; }

# Gọi DO LB + Host header để khớp Ingress rule (EN: DO LB + Host header to match Ingress rule)
call() { curl -s -H "Host: ${HOST_HEADER}" "http://${LB_IP}$1"; }

cmd_apply() {
  log "Apply 3 Deployment + Service + Ingress"
  kubectl apply -f users-app-deployment.yaml
  kubectl apply -f orders-app-deployment.yaml
  kubectl apply -f products-app-deployment.yaml
  kubectl apply -f backend-ingress.yaml
  kubectl rollout status deploy/users-app    --timeout=120s
  kubectl rollout status deploy/orders-app   --timeout=120s
  kubectl rollout status deploy/products-app --timeout=120s
  ok "3 backend sẵn sàng (EN: all 3 backends ready)"
  kubectl get pods -l 'app in (users-app,orders-app,products-app)' -o wide
}

cmd_data() {
  log "[Data] 3 path → 3 dataset khác nhau (Ingress L7 route theo URL path)"
  note "GET /api/users"
  call /api/users    | sed -E 's/,/\n    /g' | head -12; echo
  note "GET /api/orders"
  call /api/orders   | sed -E 's/,/\n    /g' | head -14; echo
  note "GET /api/products"
  call /api/products | sed -E 's/,/\n    /g' | head -16; echo
  ok "Một public IP duy nhất phục vụ cả 3 backend — sức mạnh L7 routing"
}

cmd_rr() {
  log "[Round-Robin] Bên trong từng service, traffic phân đều qua 3 pod"
  for path in /api/users/whoami /api/orders/whoami /api/products/whoami; do
    note "6 request → ${path}"
    for i in 1 2 3 4 5 6; do
      # In service + pod gọn một dòng (EN: print service + pod concisely)
      call "$path" | sed -E 's/.*"service":"([^"]+)".*"pod":"([^"]+)".*/    \1 → \2/'
    done
  done
  ok "Mỗi service round-robin độc lập trong pool riêng"
}

cmd_scale() {
  log "[Scale] users-app 3 → 6 (orders/products giữ nguyên)"
  kubectl scale deploy/users-app --replicas=6
  kubectl rollout status deploy/users-app --timeout=120s
  note "12 request /api/users/whoami — phân bổ qua 6 pod"
  for i in $(seq 1 12); do
    call /api/users/whoami | sed -E 's/.*"pod":"([^"]+)".*/    \1/'
  done

  log "[Scale] users-app 6 → 1"
  kubectl scale deploy/users-app --replicas=1
  kubectl rollout status deploy/users-app --timeout=120s
  note "5 request → đều 1 pod"
  for i in 1 2 3 4 5; do
    call /api/users/whoami | sed -E 's/.*"pod":"([^"]+)".*/    \1/'
  done
  ok "Scale một service không ảnh hưởng 2 service còn lại"
}

cmd_failover() {
  log "[Fail-Over] Kill 1 pod orders-app"
  kubectl scale deploy/orders-app --replicas=3
  kubectl rollout status deploy/orders-app --timeout=120s

  local victim
  victim=$(kubectl get pods -l app=orders-app -o jsonpath='{.items[0].metadata.name}')
  note "Xoá pod: $victim"
  kubectl delete pod "$victim" --wait=false

  note "Bắn 15 request /api/orders/whoami — Ingress phải bỏ qua pod đang chết"
  for i in $(seq 1 15); do
    call /api/orders/whoami | sed -E 's/.*"pod":"([^"]+)".*/    \1/' || echo "    (lỗi)"
    sleep 0.2
  done
  ok "Không 5xx kéo dài — fail-over nhờ readinessProbe + Ingress"
}

cmd_clean() {
  log "Xoá manifest"
  kubectl delete --ignore-not-found=true \
    -f backend-ingress.yaml \
    -f users-app-deployment.yaml \
    -f orders-app-deployment.yaml \
    -f products-app-deployment.yaml
  ok "Dọn sạch"
}

case "${1:-}" in
  apply)    cmd_apply ;;
  data)     cmd_data ;;
  rr)       cmd_rr ;;
  scale)    cmd_scale ;;
  failover) cmd_failover ;;
  all)      cmd_apply; cmd_data; cmd_rr; cmd_scale; cmd_failover ;;
  clean)    cmd_clean ;;
  *)
    echo "Usage: LB_IP=<do-lb-ip> bash demo.sh {apply|data|rr|scale|failover|all|clean}"
    exit 1
    ;;
esac
