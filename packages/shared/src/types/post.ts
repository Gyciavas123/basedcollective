import { PublicUser } from './user';

export type PostStatus = 'PROCESSING' | 'STAGING' | 'APPROVED' | 'REJECTED' | 'REMOVED';

export interface PostSummary {
  id: string;
  channelSlug: string;
  channelName: string;
  author: PublicUser;
  title: string;
  body: string;
  status: PostStatus;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  score: number;
  media: PostMediaInfo[];
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
  isSaved: boolean;
  createdAt: string;
  approvedAt: string | null;
}

export interface PostDetail extends PostSummary {
  replies: ReplyNode[];
  editedAfterApproval: boolean;
}

export interface ReplyNode {
  id: string;
  author: PublicUser;
  body: string;
  parentId: string | null;
  upvoteCount: number;
  downvoteCount: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
  children: ReplyNode[];
  createdAt: string;
  updatedAt: string;
}

export interface PostMediaInfo {
  id: string;
  url: string;
  type: 'image' | 'video';
  mimeType: string;
}
