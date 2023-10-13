export interface IUser {
  id: string;
  username: string;
  email: string;
  hash: string;
  createdAt: Date;
}

export interface IUserAndFollowing {
  id: string;
  username: string;
  email: string;
  hash: string;
  createdAt: Date;
  following: IFollowing[];
}

interface IFollowing {
  id: number;
  username: string;
  following: string;
}

export enum followOrUnfollow {
  follow = "follow",
  unfollow = "unfollow",
}
