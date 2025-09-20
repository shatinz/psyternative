import type { LucideIcon } from 'lucide-react';

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  hasChangedUsername: boolean;
};

export type Reply = {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  replies?: Reply[];
};

export type Post = {
  id: string;
  title: string;
  author: User;
  content: string;
  createdAt: Date;
  replies: Reply[];
  sectionSlug: string;
};

export type Section = {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
};

export type Art = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  seller: User;
  createdAt: Date;
};
