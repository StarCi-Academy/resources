export enum OrderSagaStep {
    CREATE_ORDER = 'CREATE_ORDER', // tạo order
    CHARGE_PAYMENT = 'CHARGE_PAYMENT', // thanh toán
    DEDUCT_INVENTORY = 'DEDUCT_INVENTORY', // trừ inventory
    REFUND_PAYMENT = 'REFUND_PAYMENT', // hoàn tiền
    CANCEL_ORDER = 'CANCEL_ORDER', // hủy order
    CONFIRM_ORDER = 'CONFIRM_ORDER', // xác nhận order
  }