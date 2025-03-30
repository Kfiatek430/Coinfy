export interface Currency {
    currency: string;
    table: string;
    code: string;
    mid: number;
    ask?: number;
    bid?: number;
}