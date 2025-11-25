import { User, Post, Group, Message, ChatRoom, Notification, Event, Poll } from '../types';
import { format, subDays, addDays, addHours } from 'date-fns';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka.taro@company.com',
    avatarUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg',
    department: '営業部',
    position: '営業マネージャー',
    skills: ['商談', 'プレゼンテーション', '顧客管理', 'マーケティング'],
    interests: ['ゴルフ', '読書', '料理'],
    joinedAt: '2022-01-15',
    role: 'admin'
  },
  {
    id: '2',
    name: '佐藤 美咲',
    email: 'sato.misaki@company.com',
    avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    department: 'マーケティング部',
    position: 'マーケティングマネージャー',
    skills: ['コンテンツ戦略', 'SNSマーケティング', 'SEO', 'データ分析'],
    interests: ['旅行', 'ヨガ', '写真'],
    joinedAt: '2022-04-22',
    role: 'editor'
  },
  {
    id: '3',
    name: '鈴木 健一',
    email: 'suzuki.kenichi@company.com',
    avatarUrl: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
    department: '商品開発部',
    position: 'プロダクトマネージャー',
    skills: ['プロジェクト管理', 'UXリサーチ', 'アジャイル開発', 'ロードマップ作成'],
    interests: ['ランニング', 'テニス', '映画鑑賞'],
    joinedAt: '2021-11-10',
    role: 'editor'
  },
  {
    id: '4',
    name: '山田 花子',
    email: 'yamada.hanako@company.com',
    avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    department: 'デザイン部',
    position: 'UIデザイナー',
    skills: ['UIデザイン', 'Figma', 'ユーザーリサーチ', 'プロトタイピング'],
    interests: ['アート', '音楽', 'カフェ巡り'],
    joinedAt: '2022-03-05',
    role: 'user'
  },
  {
    id: '5',
    name: '中村 誠',
    email: 'nakamura.makoto@company.com',
    avatarUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    department: '財務部',
    position: '財務アナリスト',
    skills: ['財務分析', 'Excel', 'データ分析', '予算管理'],
    interests: ['投資', 'ゴルフ', 'ガーデニング'],
    joinedAt: '2021-08-17',
    role: 'user'
  },
];

// Mock Posts
export const posts: Post[] = [
  {
    id: '1',
    content: '四半期レポートが完成しました！チーム一丸となって頑張った成果です。特筆すべき点として、全製品においてユーザーエンゲージメントが15%上昇しています。添付の要約をご確認ください。',
    authorId: '1',
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [
      {
        id: '1',
        name: '2024年Q1_レポート要約.pdf',
        type: 'pdf',
        url: '#',
        size: 2500000,
      }
    ],
    likes: ['2', '3', '5'],
    comments: [
      {
        id: '1',
        content: '素晴らしい成果ですね！特にユーザー継続率に関する洞察が非常に価値があります。',
        authorId: '2',
        createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: ['1', '3'],
      },
      {
        id: '2',
        content: 'レポートの迅速な作成ありがとうございます。午後に詳しく確認させていただきます。',
        authorId: '5',
        createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: ['1'],
      }
    ],
  },
  {
    id: '2',
    content: '来週から新しい商品管理ダッシュボードがリリースされます！プレビューをご覧ください。フィードバックお待ちしています！',
    authorId: '3',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [
      {
        id: '2',
        name: 'ダッシュボード_プレビュー.png',
        type: 'image',
        url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        size: 1800000,
      }
    ],
    likes: ['1', '2', '4', '5'],
    comments: [
      {
        id: '3',
        content: 'デザインが素晴らしいですね！新しい可視化要素が特に良いと思います。',
        authorId: '4',
        createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: ['1', '3'],
      }
    ],
    groupId: '1',
  },
  {
    id: '3',
    content: '【リマインダー】明日午前10時より全体会議を開催します。場所は本社会議室です。Q3戦略と今後のオフィスリノベーションについて話し合います。皆様のご参加をお待ちしております。',
    authorId: '5',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [],
    likes: ['1', '2', '3', '4'],
    comments: [
      {
        id: '4',
        content: '参加できない場合は、録画を共有していただけますか？',
        authorId: '2',
        createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: [],
      },
      {
        id: '5',
        content: 'はい、会議後にイントラネットで録画を共有させていただきます。',
        authorId: '5',
        createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: ['2'],
      }
    ],
  },
  {
    id: '4',
    content: 'デザインシステムのドキュメントが完成しました。これにより、全プロダクトでの一貫性が保てるはずです。ご質問があればお気軽にどうぞ！',
    authorId: '4',
    createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [
      {
        id: '3',
        name: 'デザインシステムガイド_v1.pdf',
        type: 'pdf',
        url: '#',
        size: 3500000,
      }
    ],
    likes: ['1', '3'],
    comments: [
      {
        id: '6',
        content: 'まさに必要としていたものです！体系的にまとめていただき、ありがとうございます。',
        authorId: '1',
        createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        likes: ['4'],
      }
    ],
    groupId: '2',
  },
];

// Mock Groups
export const groups: Group[] = [
  {
    id: '1',
    name: '商品開発プロジェクト',
    description: '新商品開発に関する議論と最新情報の共有',
    coverUrl: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2022-01-10',
    creatorId: '3',
    members: ['1', '3', '4', '5'],
    isPrivate: false,
  },
  {
    id: '2',
    name: 'デザインチーム',
    description: 'デザインチームのリソース共有、インスピレーション、フィードバック',
    coverUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2022-02-15',
    creatorId: '4',
    members: ['1', '4'],
    isPrivate: false,
  },
  {
    id: '3',
    name: 'マーケティングキャンペーン',
    description: 'マーケティングキャンペーンの企画と調整',
    coverUrl: 'https://images.pexels.com/photos/7688340/pexels-photo-7688340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2022-03-10',
    creatorId: '2',
    members: ['2', '3', '4'],
    isPrivate: true,
  },
];

// Mock Messages
export const messages: Message[] = [
  {
    id: '1',
    content: 'レポートの進捗はいかがですか？',
    senderId: '1',
    receiverId: '2',
    groupId: null,
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [],
    isRead: true,
  },
  {
    id: '2',
    content: 'もう少しで完了です！数字の最終確認をしています。1時間程度でお送りできると思います。',
    senderId: '2',
    receiverId: '1',
    groupId: null,
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [],
    isRead: true,
  },
  {
    id: '3',
    content: '皆様、最新の商品モックアップを添付しましたのでご確認ください。',
    senderId: '4',
    receiverId: null,
    groupId: '2',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    attachments: [
      {
        id: '4',
        name: '商品モックアップ_v2.png',
        type: 'image',
        url: '#',
        size: 2200000,
      }
    ],
    isRead: true,
  },
];

// Mock Chat Rooms
export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    participants: ['1', '2'],
    lastMessageAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isGroup: false,
  },
  {
    id: '2',
    participants: ['1', '3'],
    lastMessageAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isGroup: false,
  },
  {
    id: '3',
    participants: ['1', '3', '4', '5'],
    lastMessageAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    isGroup: true,
    name: 'プロジェクトXチーム',
  },
];

// Mock Notifications - Now using Supabase
export const notifications: Notification[] = [];

// Mock Events
export const events: Event[] = [
  {
    id: '1',
    title: '四半期全体会議',
    description: '四半期目標と成果の確認',
    startDate: format(addDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    endDate: format(addDays(addHours(new Date(), 2), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    location: '本社会議室',
    creatorId: '1',
    attendees: ['1', '2', '3', '4', '5'],
  },
  {
    id: '2',
    title: '商品デザインワークショップ',
    description: '新商品機能のブレインストーミングセッション',
    startDate: format(addDays(new Date(), 10), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    endDate: format(addDays(addHours(new Date(), 4), 10), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    location: 'デザインラボ',
    creatorId: '4',
    attendees: ['1', '3', '4'],
    groupId: '1',
  },
  {
    id: '3',
    title: '社内懇親会',
    description: '四半期の成功を祝して、ドリンクとスナックをご用意しています',
    startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    endDate: format(addDays(addHours(new Date(), 3), 7), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    location: 'ルーフトップラウンジ',
    creatorId: '5',
    attendees: ['1', '2', '3', '4', '5'],
  },
];

// Mock Polls
export const polls: Poll[] = [
  {
    id: '1',
    question: '次回のチームビルディングイベントの日程はいつが良いですか？',
    options: [
      {
        id: '1',
        text: '今月最終金曜日',
        votes: ['1', '3'],
      },
      {
        id: '2',
        text: '来月第一土曜日',
        votes: ['2', '4', '5'],
      },
      {
        id: '3',
        text: '平日の業務後',
        votes: [],
      }
    ],
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    expiresAt: format(addDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    creatorId: '1',
    isMultipleChoice: false,
  },
  {
    id: '2',
    question: '次期プロジェクトで使用する技術スタックを選んでください',
    options: [
      {
        id: '4',
        text: 'React Native',
        votes: ['1', '3', '4'],
      },
      {
        id: '5',
        text: 'Flutter',
        votes: ['2'],
      },
      {
        id: '6',
        text: 'Vue.js',
        votes: ['5'],
      }
    ],
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    expiresAt: format(addDays(new Date(), 4), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    creatorId: '3',
    isMultipleChoice: true,
    groupId: '1',
  },
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getPostById = (id: string): Post | undefined => {
  return posts.find(post => post.id === id);
};

export const getGroupById = (id: string): Group | undefined => {
  return groups.find(group => group.id === id);
};

export const getPostsByGroupId = (groupId: string): Post[] => {
  return posts.filter(post => post.groupId === groupId);
};

export const getDirectMessages = (userId1: string, userId2: string): Message[] => {
  return messages.filter(
    msg => 
      (msg.senderId === userId1 && msg.receiverId === userId2) || 
      (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getGroupMessages = (groupId: string): Message[] => {
  return messages.filter(msg => msg.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getNotificationsByUserId = (): Notification[] => {
  return notifications;
};

export const getEventsByUserId = (userId: string): Event[] => {
  return events.filter(event => event.attendees.includes(userId));
};

export const getPollsForUser = (): Poll[] => {
  return polls;
};