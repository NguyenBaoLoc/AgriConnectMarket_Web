export interface PreOrderRequest {
  customerId: string;
  addressId: string;
  batchId: string;
  quantity: number;
  note: string;
}

export interface PreOrderData {
  orderCode: string;
  quantity: number;
  orderDate: string;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  note: string;
  order: {
    customerId: string;
    addressId: string;
    orderCode: string;
    totalPrice: number;
    orderDate: string;
    shippingFee: number;
    orderStatus: string;
    orderType: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    customer: {
      fullname: string;
      email: string;
      phone: string;
      avatarUrl: string;
      accountId: string;
      orders: any[];
      createdAt: string;
      id: string;
    };
    preOrder: {
      orderId: string;
      batchId: string;
      quantity: number;
      note: string;
      batch: {
        batchCode: {
          value: string;
        };
        totalYield: number;
        availableQuantity: number;
        units: string;
        price: number;
        verificationQr: string;
        plantingDate: string;
        harvestDate: string;
        seasonId: string;
        preOrders: any[];
        imageUrls: string[];
        createdAt: string;
        updatedAt: string;
        id: string;
      };
    };
    orderItems: any[];
    id: string;
  };
}

export interface PreOrderResponse {
  success: boolean;
  message: string;
  data: PreOrderData;
}
