export type ChannelStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED' | 'DISABLED';

export interface ChannelSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ChannelStatus;
  postCount: number;
  memberCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface ChannelDetail extends ChannelSummary {
  rules: string | null;
  owner: {
    id: string;
    displayName: string;
    slug: string;
  };
}
