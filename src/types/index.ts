export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverImageUrl?: string;
  department: string;
  position: string;
  skills: string[];
  interests: string[];
  joinedAt: string;
  role: 'admin' | 'editor' | 'user';
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  attachments: Attachment[];
  likes: string[]; // user IDs
  comments: Comment[];
  groupId?: string; // If posted in a group
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likes: string[]; // user IDs
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf' | 'excel' | 'other';
  url: string;
  size: number; // in bytes
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  createdAt: string;
  creatorId: string;
  members: string[]; // user IDs
  isPrivate: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null; // null for group messages
  groupId: string | null; // null for direct messages
  createdAt: string;
  attachments: Attachment[];
  isRead: boolean;
  reactions?: Record<string, string[]>;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // user IDs
  lastMessageAt: string;
  isGroup: boolean;
  name?: string; // only for group chats
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'message' | 'mention' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  creatorId: string;
  attendees: string[]; // user IDs
  groupId?: string; // If associated with a group
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  expiresAt: string;
  creatorId: string;
  isMultipleChoice: boolean;
  groupId?: string; // If associated with a group
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}