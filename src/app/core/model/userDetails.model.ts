import { Roles } from './roles.enum';

export interface UserDetails {
  created?: string;
  email: string;
  fullname: string;
  jobTitle: string;
  phone: string;
  role?: Roles;
  securityQuestion?: string;
  securityQuestionAnswer?: string;
  uid?: string;
  updated?: string;
  updatedBy?: string;
  username?: string;
  status?: UserStatus;
  isPrimary?: boolean;
}

export enum UserStatus {
  Pending = 'Pending',
  Active = 'Active',
}
