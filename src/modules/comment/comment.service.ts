import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as Nano from "nano";
import { CreateCommentDto } from "src/api_gateway/dto/comment-dto/index";
import { DATABASES } from "./types";
import { randomUUID } from "crypto";

@Injectable()
export class CommentService {
  private readonly couchdb: Nano.ServerScope;
  constructor() {
    this.couchdb = Nano(process.env.COUCHDB_URL);
  }

  async createComment(
    comment: CreateCommentDto,
  ): Promise<Nano.DocumentInsertResponse> {
    const db = await this.getDB(DATABASES.COMMENTS);
    const data = {
      postId: comment.postId,
      userId: comment.userId,
      username: comment.username,
      comment: comment.comment,
      answers: [],
      createdAt: Date.now(),
    };
    const result = await db.insert(data as any);
    return result;
  }

  async getAllComments(): Promise<Nano.DocumentListResponse<unknown>> {
    const db = await this.getDB(DATABASES.COMMENTS);
    const result = await db.list({ include_docs: true });
    return result;
  }

  async getAllCommentsByPostId(postId: string): Promise<any> {
    const db = await this.getDB(DATABASES.COMMENTS);
    const result = await db.find({
      selector: {
        postId: postId,
      },
      fields: [
        "_id",
        "_rev",
        "postId",
        "userId",
        "username",
        "comment",
        "answers",
      ],
    });
    return result;
  }

  async getAllCommentsByUserId(userId: string): Promise<any> {
    const db = await this.getDB(DATABASES.COMMENTS);
    const result = await db.find({
      selector: {
        userId: userId,
      },
      fields: [
        "_id",
        "_rev",
        "postId",
        "userId",
        "username",
        "comment",
        "answers",
      ],
    });
    return result;
  }

  async answerComment(commentInput: any): Promise<any> {
    const db = await this.getDB(DATABASES.COMMENTS);
    try {
      const result = (await db.get(commentInput.commentId)) as any;

      result.answers.push({
        _id: randomUUID(),
        parentComment: result._id,
        userId: commentInput.userId,
        username: commentInput.username,
        Comment: commentInput.comment,
        createAt: Date.now(),
      });

      return await db.insert(result);
    } catch (error) {
      if (error.description === "missing") {
        throw new BadRequestException("Comment Not Found");
      }
      throw new InternalServerErrorException(error.description);
    }
  }

  private async getDB(db: DATABASES) {
    try {
      const result = await this.couchdb.db.create(db);
      if (result.ok) {
        return this.couchdb.db.use(db);
      }
    } catch (error) {
      //check if DB already exists
      if (error.errid === "non_200") return this.couchdb.db.use(db);
    }
  }
}
