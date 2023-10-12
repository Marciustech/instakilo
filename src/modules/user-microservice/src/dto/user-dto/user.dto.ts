export class UniqueUser {
    id: string;
    username: string;
    email: string;
    hash: string;
    createdAt: Date;
    hashedRefreshToken: string;
}