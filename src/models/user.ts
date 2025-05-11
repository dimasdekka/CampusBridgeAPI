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
export const USERS: User[] = [
  {
    email: 'student@university.edu',
    id: '7z6ydcm',
    role: UserRole.Student,
    name: 'Student Name',
    department: 'Computer Science',
    hashed_password:
      '$2b$10$.MftzcPPsR5TUTYRyWGyQu9H9Fd3Q6olBlccI1qIAY3qXH7OQ.bQO', // dummy "123456"
  },
  {
    email: 'professor@university.edu',
    id: '41m3lxk',
    role: UserRole.Professor,
    name: 'Professor Name',
    department: 'Computer Science',
    hashed_password:
      '$2b$10$.MftzcPPsR5TUTYRyWGyQu9H9Fd3Q6olBlccI1qIAY3qXH7OQ.bQO', // dummy "123456"
  },
];
