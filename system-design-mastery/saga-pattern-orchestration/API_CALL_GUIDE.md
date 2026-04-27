# Huong Dan Cai Dat Va Test API Order Saga

Tai lieu nay danh cho nguoi moi vao project. Ban chi can lam theo tung buoc tu tren xuong duoi la co the test duoc 3 tinh huong cua saga.

## 1) Cai dat moi truong

### 1.1 Yeu cau

- Node.js 20+ (khuyen nghi LTS)
- npm 10+
- Port `3000` dang ranh

### 1.2 Cai dependencies

Mo terminal tai thu muc goc project, chay:

```bash
npm install
```

## 2) Chay cac service

Project nay gom nhieu app nho. Ban mo 4 terminal va chay lan luot:

```bash
nest start order-orchestation
```

```bash
nest start order
```

```bash
nest start payment
```

```bash
nest start inventory
```

Sau khi chay xong, endpoint orchestration co the goi tai:

- `http://localhost:3000`

## 3) Test 3 tinh huong order saga

`productId` mau duoi day la ID dang co san trong DB local cua project.
Neu may ban khac du lieu, hay thay bang `productId` hop le cua ban.

### 3.1 Case A - Thanh cong (order duoc confirm)

#### Cach 1: Dung curl

```bash
curl -X POST http://localhost:3000/order -H "Content-Type: application/json" -d '{"productId":"490d6df0-391c-45ad-8f39-8467f761a665","quantity":2,"amount":200000}'
```

#### Cach 2: Dung Postman

1. Tao request moi.
2. Chon method `POST`.
3. URL: `http://localhost:3000/order`
4. Tab `Headers`: them `Content-Type: application/json`
5. Tab `Body` -> `raw` -> `JSON`, dan payload:

```json
{
  "productId": "490d6df0-391c-45ad-8f39-8467f761a665",
  "quantity": 2,
  "amount": 200000
}
```

6. Bam `Send`.

Ky vong:

- Payment thanh cong (`PAID`)
- Inventory tru kho thanh cong (`DEDUCTED`)
- Order ket thuc o trang thai `CONFIRMED`
- `sagaStatus` = `COMPLETED`

### 3.2 Case B - Payment fail (amount vuot nguong)

#### Cach 1: Dung curl

```bash
curl -X POST http://localhost:3000/order -H "Content-Type: application/json" -d '{"productId":"490d6df0-391c-45ad-8f39-8467f761a665","quantity":2,"amount":2000000}'
```

#### Cach 2: Dung Postman

1. Duplicate request cua Case A.
2. Giu nguyen `productId`, `quantity`.
3. Sua `amount` thanh `2000000`.
4. Bam `Send`.

Body JSON:

```json
{
  "productId": "490d6df0-391c-45ad-8f39-8467f761a665",
  "quantity": 2,
  "amount": 2000000
}
```

Ky vong:

- Payment fail (vuot nguong amount)
- Order bi huy (`CANCELLED`)
- `sagaStatus` = `FAILED`
- `reason` = `"Payment failed"`

### 3.3 Case C - Inventory fail (khong du ton kho)

#### Cach 1: Dung curl

```bash
curl -X POST http://localhost:3000/order -H "Content-Type: application/json" -d '{"productId":"490d6df0-391c-45ad-8f39-8467f761a665","quantity":12,"amount":200000}'
```

#### Cach 2: Dung Postman

1. Duplicate request cua Case A.
2. Giu nguyen `productId`, `amount`.
3. Sua `quantity` thanh `12` (cao hon ton kho mac dinh).
4. Bam `Send`.

Body JSON:

```json
{
  "productId": "490d6df0-391c-45ad-8f39-8467f761a665",
  "quantity": 12,
  "amount": 200000
}
```

Ky vong:

- Payment charge thanh cong o buoc truoc
- Inventory fail vi khong du so luong
- He thong chay compensation (refund payment)
- Order bi huy (`CANCELLED`)
- `sagaStatus` = `COMPENSATED`

## 4) Kiem tra log tren terminal

Khi goi API, ban se thay log theo thu tu xu ly cua tung service:

- `Orchestration`: bat dau saga, xu ly payment/inventory, ket thuc saga
- `Order`: tao order, cap nhat trang thai order
- `Payment`: charge payment, refund neu can compensation
- `Inventory`: tru kho hoac bao loi ton kho

Vi du chuoi log de de theo doi:

```text
[Orchestration] Start saga - productId=... quantity=2 amount=200000
[Order] Created order - orderId=...
[Payment] Charge success - orderId=...
[Inventory] Deduct success - productId=...
[Order] Updated status - orderId=... status=CONFIRMED
[Orchestration] Saga completed - orderId=...
```
