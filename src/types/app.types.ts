// This file is used to define the types for the app.
// enum APP_TYPES {
//   HOME = "home",
//   SETTINGS = "settings",
// }

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  modelId: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  size: number;
  repo: string;
  file: string;
  downloaded: boolean;
  downloadProgress?: number;
  tags: string[];
  parameters: string | number;
  lastModified: string;
  usedStorage: number;
  downloadCount: number;
}

export interface DownloadedModel extends Model {
  localPath: string;
  downloadedAt: number;
}

export interface ModelContext {
  completion: (
    params: {
      messages: Message[];
      n_predict: number;
      stop: string[];
    },
    callback?: (data: { token: string }) => void,
  ) => Promise<{ text: string }>;
  release: () => Promise<void>;
}
