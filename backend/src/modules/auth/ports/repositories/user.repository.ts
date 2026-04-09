export interface UserRepository {
  findByUsername(username: string): Promise<any>;
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
}