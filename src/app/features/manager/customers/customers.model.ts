export interface ManagerCustomerResponse {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address?: string;
  email?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: number;
}




