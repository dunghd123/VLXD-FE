import { InvoiceStatusEnums } from "../../../shared/models/enums.model";

export interface OutputInvoiceRequest {
    cusId: number,
    empId: number,
    creationTime: string,
    updateTime: string,
    listInvoiceDetails: OutputInvoiceDetailRequest[],
};

export interface OutputInvoiceDetailRequest {
    proId: number,
    whId: number,
    quantity: number,
};
export interface OutputInvoiceResponse {
    id: number,
    cusName: string,
    empName: string,
    creationTime: string,
    updateTime: string,
    status: InvoiceStatusEnums,
    listOutputInvoiceDetails: OutputInvoiceDetailResponse[],
    totalAmount: number,
};

export interface OutputInvoiceDetailResponse {
    id: number,
    productName: string,
    unitMeasure: string,
    quantity: number,
    price: number,
    amount: number,
    warehouseName: string
};

export interface OutputInvoiceFilter {
    cusNameFilter: string,
    statusFilter?: InvoiceStatusEnums | null,
    pageFilter: number;
    sizeFilter: number;
};
