import { InvoiceStatusEnums } from "../../../shared/models/enums.model";

export interface InputInvoiceRequest {
    supId: number,
    empId: number,
    creationTime: string,
    updateTime: string,
    listInvoiceDetails: InputInvoiceDetailRequest[],
};

export interface InputInvoiceDetailRequest {
    proId: number,
    whId: number,
    quantity: number,
};
export interface InputInvoiceResponse {
    id: number,
    supName: string,
    empName: string,
    creationTime: string,
    updateTime: string,
    status: InvoiceStatusEnums,
    listInvoiceDetails: InputInvoiceDetailResponse[],
    totalAmount: number,
};

export interface InputInvoiceDetailResponse {
    id: number,
    productName: string,
    unitMeasure: string,
    quantity: number,
    price: number,
    amount: number,
    warehouseName: string
};

export interface InputInvoiceFilter {
    supNameFilter: string,
    statusFilter?: InvoiceStatusEnums | null,
    pageFilter: number;
    sizeFilter: number;
};
