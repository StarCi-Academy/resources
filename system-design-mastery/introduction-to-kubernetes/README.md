# Introduction to Kubernetes - Pod Practice

## Mục tiêu / Objective

### Tiếng Việt
- Chạy 3 Pod cơ bản: MySQL, Nginx và game 2048.
- Hiểu quy trình deploy Pod, kiểm tra trạng thái, và test dịch vụ bằng `port-forward`.

### English
- Run 3 basic Pods: MySQL, Nginx, and the 2048 game.
- Understand how to deploy Pods, verify status, and test services via `port-forward`.

## Cấu trúc file / File Structure

### Tiếng Việt
- `mysql-pod.yaml`: Manifest Pod cho MySQL.
- `nginx-pod.yaml`: Manifest Pod cho Nginx.
- `game-2048-pod.yaml`: Manifest Pod cho game web 2048.

### English
- `mysql-pod.yaml`: Pod manifest for MySQL.
- `nginx-pod.yaml`: Pod manifest for Nginx.
- `game-2048-pod.yaml`: Pod manifest for the 2048 web game.

## Bước 1 - Setup môi trường / Step 1 - Environment Setup

### Tiếng Việt
Kiểm tra `kubectl` đã kết nối đến cluster và node đã sẵn sàng:

### English
Verify that `kubectl` is connected to the cluster and nodes are ready:

```bash
kubectl cluster-info
kubectl get nodes
```

## Bước 2 - Deploy Pod / Step 2 - Deploy Pods

### Tiếng Việt
Apply lần lượt 3 file manifest:

### English
Apply the three manifest files:

```bash
kubectl apply -f mysql-pod.yaml
kubectl apply -f nginx-pod.yaml
kubectl apply -f game-2048-pod.yaml
```

## Bước 3 - Kiểm tra trạng thái / Step 3 - Verify Status

### Tiếng Việt
Xác nhận Pod đã `Running`, xem chi tiết và log khi cần:

### English
Confirm Pods are `Running`, then inspect details/logs when needed:

```bash
kubectl get pods -o wide
kubectl describe pod mysql-pod
kubectl logs game-2048-pod
```

## Bước 4 - Port-forward để test / Step 4 - Port-forward for Testing

### 4.1 Nginx

```bash
kubectl port-forward pod/nginx-pod 8080:80
```

- VI: Mở trình duyệt tại `http://localhost:8080`.
- EN: Open `http://localhost:8080` in your browser.

### 4.2 Game 2048

```bash
kubectl port-forward pod/game-2048-pod 8081:80
```

- VI: Mở trình duyệt tại `http://localhost:8081`.
- EN: Open `http://localhost:8081` in your browser.

### 4.3 MySQL

```bash
kubectl port-forward pod/mysql-pod 3307:3306
```

- VI: Kết nối từ local vào MySQL qua cổng 3307.
- EN: Connect to MySQL locally through port 3307.

```bash
mysql -h 127.0.0.1 -P 3307 -u root -p
```

- VI: Mật khẩu root trong manifest là `root123`.
- EN: The root password in the manifest is `root123`.

## Luồng hệ thống / System Flow

- VI: `Client (localhost)` -> `kubectl port-forward` -> `Pod đích` -> `Phản hồi về client`.
- EN: `Client (localhost)` -> `kubectl port-forward` -> `Target Pod` -> `Response back to client`.

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Sau khi demo xong, xóa các Pod để giải phóng tài nguyên cluster.

### English
After the demo, delete all Pods to free cluster resources.

```bash
kubectl delete -f mysql-pod.yaml
kubectl delete -f nginx-pod.yaml
kubectl delete -f game-2048-pod.yaml
```
