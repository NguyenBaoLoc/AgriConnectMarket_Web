const BASE_URL = 'http://192.168.1.231:5170/api';

export const API = {
  base: BASE_URL,
  address: {
    me: `${BASE_URL}/addresses/me`,
    add: `${BASE_URL}/addresses`,
    update: (addressId: string) => `${BASE_URL}/addresses/${addressId}`,
    setDefault: (addressId: string) =>
      `${BASE_URL}/addresses/${addressId}/default`,
    delete: (addressId: string) => `${BASE_URL}/addresses/${addressId}`,
  },
  auth: {
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    changePassword: `${BASE_URL}/auth/change-password`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    deactive: `${BASE_URL}/auth/me/deactive`,
    ban: (accountId: string) => `${BASE_URL}/auth/${accountId}/toggle-ban`,
  },
  category: {
    list: `${BASE_URL}/categories`,
    add: `${BASE_URL}/categories`,
    update: (categoryId: string) => `${BASE_URL}/categories/${categoryId}`,
    delete: (categoryId: string) => `${BASE_URL}/categories/${categoryId}`,
  },
  farm: {
    list: `${BASE_URL}/farms`,
    add: `${BASE_URL}/farms`,
    get: (farmId: string) => `${BASE_URL}/farms/${farmId}`,
    update: (farmId: string) => `${BASE_URL}/farms/${farmId}`,
    delete: (farmId: string) => `${BASE_URL}/farms/${farmId}`,
    me: `${BASE_URL}/farms/me`,
    addCert: (farmId: string) => `${BASE_URL}/farms/${farmId}/certificate`,
    updateCert: (farmId: string) => `${BASE_URL}/farms/${farmId}/certificates`,
    deleteCert: (farmId: string) => `${BASE_URL}/farms/${farmId}/certificate`,
    ban: (farmId: string) => `${BASE_URL}/farms/${farmId}/ban`,
  },
  product: {
    list: `${BASE_URL}/products`,
    add: `${BASE_URL}/products`,
    get: (productId: string) => `${BASE_URL}/products/${productId}`,
    update: (productId: string) => `${BASE_URL}/products/${productId}`,
    delete: (productId: string) => `${BASE_URL}/products/${productId}`,
  },
  profile: {
    update: (profileId: string) => `${BASE_URL}/profiles/${profileId}`,
    get: (profileId: string) => `${BASE_URL}/profiles/${profileId}`,
    list: `${BASE_URL}/profiles`,
    me: `${BASE_URL}/profiles/me`,
  },
  season: {
    list: `${BASE_URL}/seasons`,
    byFarm: (farmId: string) => `${BASE_URL}/seasons/farm/${farmId}`,
    add: `${BASE_URL}/seasons`,
    get: (seasonId: string) => `${BASE_URL}/seasons/${seasonId}`,
    update: (seasonId: string) => `${BASE_URL}/seasons/${seasonId}`,
    delete: (seasonId: string) => `${BASE_URL}/seasons/${seasonId}`,
    patch: (seasonId: string) => `${BASE_URL}/seasons/${seasonId}`,
    updateStatus: (seasonId: string) =>
      `${BASE_URL}/seasons/${seasonId}/status`,
  },
  productBatch: {
    list: `${BASE_URL}/product-batches`,
    getSelling: `${BASE_URL}/product-batches/selling`,
    add: `${BASE_URL}/product-batches`,
    get: (batchId: string) => `${BASE_URL}/product-batches/${batchId}`,
    bySeason: (seasonId: string) =>
      `${BASE_URL}/product-batches/season/${seasonId}`,
    verifyCareEvents: (batchId: string) =>
      `${BASE_URL}/product-batches/${batchId}/care-events/verify`,
    harvest: (batchId: string) =>
      `${BASE_URL}/product-batches/${batchId}/harvest`,
    sell: (batchId: string) => `${BASE_URL}/product-batches/${batchId}/sell`,
    stopSelling: (batchId: string) =>
      `${BASE_URL}/product-batches/${batchId}/stop-selling`,
  },
  cart: {
    me: `${BASE_URL}/carts/me`,
    add: `${BASE_URL}/carts`,
    update: (cartId: string) => `${BASE_URL}/carts/${cartId}`,
    updateItem: (cartId: string) => `${BASE_URL}/carts/${cartId}`,
    removeItem: (cartItemId: string) =>
      `${BASE_URL}/carts/cart-items/${cartItemId}`,
    deleteAll: (cartId: string) => `${BASE_URL}/carts/${cartId}/delete-all`,
  },
  order: {
    base: `${BASE_URL}/orders`,
    me: `${BASE_URL}/orders/me`,
    get: (orderId: string) => `${BASE_URL}/orders/${orderId}`,
    create: `${BASE_URL}/orders`,
    preOrder: `${BASE_URL}/orders/pre-order`,
    getByCode: (orderCode: string) =>
      `${BASE_URL}/orders/order-code/${orderCode}`,
    getByFarm: (farmId: string) => `${BASE_URL}/orders/farm/${farmId}`,
    getPreOrdersByFarm: (farmId: string) =>
      `${BASE_URL}/farm/${farmId}/pre-orders`,
    updateStatus: (orderId: string) =>
      `${BASE_URL}/orders/${orderId}/order-status`,
    approvePreOrder: (orderId: string) =>
      `${BASE_URL}/orders/pre-orders/${orderId}/approve`,
  },
  favoriteFarms: {
    me: `${BASE_URL}/favorite-farms/me`,
    add: `${BASE_URL}/favorite-farms`,
  },
  shipping: {
    calculateFee: `${BASE_URL}/ship/`,
  },
  eventType: {
    list: `${BASE_URL}/event-types`,
  },
  careEvent: {
    add: `${BASE_URL}/care-events`,
  },
  stats: {
    users: `${BASE_URL}/stats/users`,
    productPerCategory: `${BASE_URL}/stats/product-per-category`,
  },
  violationReports: {
    create: `${BASE_URL}/violation-reports`,
  },
  eventTypes: {
    list: `${BASE_URL}/event-types`,
    create: `${BASE_URL}/event-types`,
    detail: (id: string) => `${BASE_URL}/event-types/${id}`,
    delete: (id: string) => `${BASE_URL}/event-types/${id}`,
  },
  transaction: {
    list: `${BASE_URL}/transactions`,
    get: (transactionId: string) => `${BASE_URL}/transactions/${transactionId}`,
    resolve: (transactionId: string) =>
      `${BASE_URL}/transactions/${transactionId}/resolve`,
  },
};
