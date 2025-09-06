export interface CreateUserRequest {
  username: string,
  password: string,
  fullName: string,
  address: string,
  phone: string,
  managerId: number,
  dateOfBirth: string, // ISO yyyy-MM-dd
  gender: 'Nam' | 'Nữ' | 'Khác',
  role: 'EMPLOYEE' | 'MANAGER',
};


