export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  modifiedAt?: Date;
  isDeleted: boolean;
}
