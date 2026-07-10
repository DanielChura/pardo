export interface PaymentProvider {
  createCheckoutSession(
    userId: string,
    orderId: string,
  ): Promise<{ sessionUrl: string }>;
}
