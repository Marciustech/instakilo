import { BadRequestException, Injectable } from "@nestjs/common";
import PostLikes from "./models/post-likes.model";
import CommentLikes from "./models/comment-likes.model";
import { LikeCommentDto, LikePostDto } from "../../api_gateway/dto/like-dto";

@Injectable()
export class LikesService {
  constructor() {}

  async getAllPostLikes() {
    return await PostLikes.run();
  }
  async getAllCommentLikes() {
    return await CommentLikes.run();
  }

  async likePost(input: LikePostDto) {
    const alreadyLikes = await PostLikes.filter({
      userId: input.userId,
      postId: input.postId,
      username: input.username,
    }).run();

    if (alreadyLikes.length) {
      throw new BadRequestException("Already Likes Post");
    }

    const newLike = new PostLikes(input);
    return await newLike.save();
  }

  async unlikePost(input: any) {
    const alreadyLikes = await PostLikes.filter({
      userId: input.userId,
      postId: input.postId,
    }).run();

    if (!alreadyLikes.length) {
      throw new BadRequestException("User doesn't like post already");
    }

    return await PostLikes.delete();
  }

  async likeComment(input: LikeCommentDto) {
    const alreadyLikes = await CommentLikes.filter({
      userId: input.userId,
      commentId: input.commentId,
      username: input.username,
    }).run();

    if (alreadyLikes.length) {
      throw new BadRequestException("Already Likes Comment");
    }

    const newLike = new CommentLikes(input);
    return await newLike.save();
  }

  async unlikeComment(input: any) {
    const alreadyLikes = await CommentLikes.filter({
      userId: input.userId,
      commentId: input.commentId,
    }).run();

    if (!alreadyLikes.length) {
      throw new BadRequestException("User doesn't like comment already");
    }

    return await CommentLikes.delete();
  }
}
