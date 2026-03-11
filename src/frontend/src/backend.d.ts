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
export interface backendInterface {
    deleteDesign(id: bigint): Promise<void>;
    getDesign(id: bigint): Promise<Design>;
    listDesigns(): Promise<Array<Design>>;
    saveDesign(title: string, data: string, thumbnailUrl: string): Promise<bigint>;
}
