export interface UpdateUserRequest {
  id: number,
  username: string,
  password?: string, // Optional for update
  fullName: string,
  address: string,
  phone: string,
  managerId: number,
  dateOfBirth: string, // ISO yyyy-MM-dd
  gender: 'MALE' | 'FEMALE' | 'OTHER',
  role: 'EMPLOYEE' | 'MANAGER',
};


