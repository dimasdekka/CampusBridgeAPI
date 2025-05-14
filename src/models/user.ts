export enum UserRole {
  Professor = 'professor',
  Student = 'student',
}

export interface User {
  id: string;
  email: string;
  hashed_password: string;
  role: UserRole;
  name?: string;
  department?: string;
}

// Added only for testing purposes
export const USERS: User[] = [];
