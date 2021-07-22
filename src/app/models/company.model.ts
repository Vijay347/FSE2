import { AuditFields } from "./audit.model";

declare type stockExchange = 'BSE' | 'NSE' | '' | null | undefined;

export interface Company {
    id?: any;
    code?: string;
    name?: string;
    ceo?: string;
    turnover?: string;
    website?: string;
    stockExchange?: stockExchange;
    stockDetails?: Stock[];
}

export interface Stock {
    id?: any;
    companyId?: any;
    companyName?: any;
    price?: any;
    date?: any;
    time?: any;
}

export interface CompanyDetails extends AuditFields {
    id?: any;
    code?: string,
    name?: string,
    ceo?: string,
    turnover?: number,
    website?: string,
    stockExchange?: string,
    stockDetails?: Stock[];
}