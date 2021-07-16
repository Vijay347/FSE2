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