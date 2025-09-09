export interface ManagerSupplierResponse {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

export interface CreateSupplierRequest {
  name: string;
  phone: string;
  address?: string;
  email?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: number;
}


