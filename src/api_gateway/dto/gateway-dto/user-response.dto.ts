export class UniqueUserResponse {
    id: string;
    username: string;
    email: string;
    hash: string;
    createdAt: Date;
    hashedRefreshToken: string;
}