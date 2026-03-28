export type NotificationEventType =
  | 'REPLY_TO_POST'
  | 'REPLY_TO_COMMENT'
  | 'UPVOTE_ON_POST'
  | 'UPVOTE_ON_COMMENT'
  | 'POST_APPROVED'
  | 'POST_REJECTED'
  | 'ACCOUNT_SUSPENDED'
  | 'APPEAL_OUTCOME'
  | 'REFERRAL_CODE_USED'
  | 'REFERRED_USER_ACCEPTED'
  | 'WORLDCOIN_LAPSE_WARNING'
  | 'SYSTEM_ANNOUNCEMENT';

export interface NotificationItem {
  id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferenceItem {
  eventType: NotificationEventType;
  inApp: boolean;
  email: boolean;
}
