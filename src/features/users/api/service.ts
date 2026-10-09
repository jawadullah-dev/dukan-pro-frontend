import { fakeUsers } from '@/constants/mock-api-users';
import type { UserFilters, UsersResponse, UserMutationPayload } from './types';

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  return fakeUsers.getUsers(filters);
}

export async function createUser(data: UserMutationPayload) {
  return fakeUsers.createUser(data);
}

export async function updateUser(id: number, data: UserMutationPayload) {
  return fakeUsers.updateUser(id, data);
}

export async function deleteUser(id: number) {
  return fakeUsers.deleteUser(id);
}
