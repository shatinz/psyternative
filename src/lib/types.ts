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
