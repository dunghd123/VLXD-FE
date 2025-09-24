export interface InputOrderResponse{
    id: number,
    code: string,
    supName: string
    creationTime:string,
    status: string,
    listInputInvoiceDetails: InputOrderDetailResponse[],
    totalAmount: number
}
export interface InputOrderDetailResponse{
    id: number,
    productName: string,
    unitMeasure: string,
    quantity: number,
    price: number,
    amount: number,
    warehouseName: string
}
export interface OutputOrderResponse{
    id: number,
    code: string,
    cusName: string
    creationTime:string,
    shipAddress?: string,
    status: string,
    listOutputInvoiceDetails: OutputOrderDetailResponse[],
    totalAmount: number
}
export interface OutputOrderDetailResponse{
    id: number,
    productName: string,
    unitMeasure: string,
    quantity: number,
    price: number,
    amount: number,
    warehouseName: string
}