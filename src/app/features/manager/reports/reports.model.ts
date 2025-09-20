export interface FilterRequest {
  startDate?: string;
  endDate?: string;
  productIds: number[];
  customerIds: number[];
  employeeIds: number[];
}
export interface Item{
  id: number;
  name: string;
}