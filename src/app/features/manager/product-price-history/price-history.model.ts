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

export interface PriceFilterResponse {
  content: PriceResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}