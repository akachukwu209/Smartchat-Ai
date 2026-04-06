export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  type: "text" | "image";
  imageUrl?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}

export interface Ability {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
  isImage?: boolean;
}
