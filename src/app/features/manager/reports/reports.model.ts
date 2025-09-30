export interface FilterRequest {
  startDate?: string;
  endDate?: string;
  typeReport?: string; 
}
export interface SaleReportResponse<T> {
  summary: Summary;
  details: T[];
}

export interface Summary {
  totalRevenue: number;
  recordCount: number;
}
export interface SalesCustomerResponse{
  cusId: number;
  cusName: string;
  totalAmount: number;
}
export interface SalesEmployeeResponse{
  empId: number;
  empName: string;
  totalAmount: number;
}
export interface SalesProductResponse{
  proId: number;
  proName: string;
  quantity: number;
  totalAmount: number;
}
