export interface PriceResponse {
  id: number;
  invoiceType: string; 
  productName: string;
  price: number;
  unitMeasure: string;
  startDate: string;
  endDate: string;   
  active: boolean;
}

export interface PriceFilterRequest {
  invoiceTypeFilter?: string;
  productNameFilter?: string;
  startDateFilter?: string;
  endDateFilter?: string;
  pageFilter: number;
  sizeFilter: number;
  priceTypeFilter?: string;
}
export interface AddPriceRequest {
 productId: number;
 invoiceType: string;
 price: number;
}
export interface UpdatePriceRequest extends Partial<AddPriceRequest> {
  id: number;
}