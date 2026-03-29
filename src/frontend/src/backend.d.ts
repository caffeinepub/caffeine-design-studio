import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Design {
    title: string;
    thumbnailUrl: string;
    data: string;
    createdAt: Time;
    updatedAt: Time;
}
export type Time = bigint;
export interface CustomerOrder {
    orderId: string;
    items: string;
    total: bigint;
    paymentMethod: string;
    timestamp: Time;
}
export interface CustomerProfile {
    sessionKey: string;
    name: string;
    email: string;
    loyaltyPoints: bigint;
    totalOrders: bigint;
    referralCode: string;
    joinedAt: Time;
}
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    deleteDesign(id: bigint): Promise<void>;
    getDesign(id: bigint): Promise<Design>;
    listDesigns(): Promise<Array<Design>>;
    saveDesign(title: string, data: string, thumbnailUrl: string): Promise<bigint>;
    registerCustomer(sessionKey: string, name: string, email: string, referralCode: string): Promise<CustomerProfile>;
    getCustomerProfile(sessionKey: string): Promise<CustomerProfile | undefined>;
    addOrderToHistory(sessionKey: string, orderId: string, items: string, total: bigint, paymentMethod: string): Promise<CustomerProfile>;
    redeemLoyaltyPoints(sessionKey: string, pointsToRedeem: bigint): Promise<CustomerProfile>;
    getOrderHistory(sessionKey: string): Promise<Array<CustomerOrder>>;
    getLeaderboard(): Promise<Array<CustomerProfile>>;
}
