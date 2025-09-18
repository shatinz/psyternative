export type ExperienceCategory = "psychedelics" | "dreams" | "meditation";

export interface Comment {
  id: string;
  author: string; // username
  authorId: string;
  createdAt: Date;
  text: string;
}

export interface ExperienceReport {
  id: string;
  title: string;
  author: string; // username
  authorId: string;
  createdAt: Date;
  experienceType: ExperienceCategory;
  reportText: string;
  summary: string;
  comments: Comment[];
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: Date;
}
