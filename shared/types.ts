export interface Template {
  id: string;
  title: string;
  previewUrl: string;
  prompt: string;
  description?: string;
  category?: string;
}

export interface EditRequest {
  image: File;
  templateId: string;
}

export interface EditResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
