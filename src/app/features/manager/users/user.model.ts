export interface UserResponse{
     id?: number,
     userName: String,
     fullName: String,
     role: String,
     phone: String,
     status: String,
     gender: String,
     address?: String,
     dateOfBirth?: String,
     managerId?: number,
};
export interface EmployeeResponse{
      id: number,
      name: string,
      gender: string,
      dob: string,
      address: string,
      phoneNum: string,
      description: string,
      isActive: boolean,
};