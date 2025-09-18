export type ExperienceCategory = "psychedelics" | "dreams" | "meditation";

export interface Comment {
  id: string;
  author: string;
  createdAt: Date;
  text: string;
}

export interface ExperienceReport {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  experienceType: ExperienceCategory;
  reportText: string;
  summary: string;
  comments: Comment[];
}
