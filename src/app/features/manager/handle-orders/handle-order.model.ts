export interface InputOrderResponse{
    id: number,
    name: string,
    price: number
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
    name: string,
    price: number
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