export interface ProductResponse {
  id: number;
  name: string;
  unitMeasure: string;
  description: string;
  cateName: string;
}

export interface CreateProductRequest {
  name: string;
  unitMeasure: string;
  description: string;
  cateName: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}
