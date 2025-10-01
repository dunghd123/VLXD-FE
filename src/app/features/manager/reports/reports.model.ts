export interface FilterRequest {
  startDate?: string;
  endDate?: string;
  typeReport?: string; 
  year?: number
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
export interface SalesMonthResponse{
  month: number;
  totalAmount: number;
}
export interface SalesQuarterResponse{
  quarter: number;
  totalAmount: number;
}
