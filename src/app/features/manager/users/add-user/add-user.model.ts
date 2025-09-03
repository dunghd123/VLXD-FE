export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  address: string;
  dateOfBirth: string; // ISO yyyy-MM-dd
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: 'EMPLOYEE' | 'MANAGER';
}


