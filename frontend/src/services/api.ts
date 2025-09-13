// Define types locally for now
export interface Template {
  id: string;
  title: string;
  previewUrl: string;
  description?: string;
  category?: string;
  prompt?: string;
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

// Import mock data
import { mockApiResponses } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Check if we should use mock data (fallback mechanism)
const shouldUseMockData = () => {
  const stored = localStorage.getItem('useMockData');
  return stored === 'true';
};

const USE_MOCK_DATA = shouldUseMockData();

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            // Retry on server errors
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  getTemplates = async (): Promise<Omit<Template, 'prompt'>[]> => {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockApiResponses.getTemplates();
    }
    
    try {
      const response = await this.request<Omit<Template, 'prompt'>[]>('/templates');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch templates');
      }
      return response.data;
    } catch (error) {
      console.warn('API failed, falling back to mock data:', error);
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockApiResponses.getTemplates();
    }
  }

  getTemplate = async (id: string): Promise<Omit<Template, 'prompt'>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const templates = await mockApiResponses.getTemplates();
      const template = templates.find(t => t.id === id);
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    }
    
    const response = await this.request<Omit<Template, 'prompt'>>(`/templates/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch template');
    }
    return response.data;
  }

  getCategories = async (): Promise<string[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockApiResponses.getCategories();
    }
    
    try {
      const response = await this.request<string[]>('/templates/categories');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      return response.data;
    } catch (error) {
      console.warn('API failed, falling back to mock data:', error);
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockApiResponses.getCategories();
    }
  }

  getTemplatesByCategory = async (category: string): Promise<Omit<Template, 'prompt'>[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockApiResponses.getTemplatesByCategory(category);
    }
    
    try {
      const response = await this.request<Omit<Template, 'prompt'>[]>(`/templates/category/${encodeURIComponent(category)}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch templates by category');
      }
      return response.data;
    } catch (error) {
      console.warn('API failed, falling back to mock data:', error);
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockApiResponses.getTemplatesByCategory(category);
    }
  }

  searchTemplates = async (query: string, category?: string, limit: number = 20): Promise<Omit<Template, 'prompt'>[]> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Simple mock search
      const allTemplates = await mockApiResponses.getTemplates();
      return allTemplates.filter(template => 
        template.title.toLowerCase().includes(query.toLowerCase()) ||
        template.description?.toLowerCase().includes(query.toLowerCase()) ||
        template.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }
    
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      if (category) {
        params.append('category', category);
      }
      
      const response = await this.request<Omit<Template, 'prompt'>[]>(`/templates/search?${params}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to search templates');
      }
      return response.data;
    } catch (error) {
      console.warn('Search API failed, falling back to mock data:', error);
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const allTemplates = await mockApiResponses.getTemplates();
      return allTemplates.filter(template => 
        template.title.toLowerCase().includes(query.toLowerCase()) ||
        template.description?.toLowerCase().includes(query.toLowerCase()) ||
        template.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }
  }

  editImage = async (editRequest: EditRequest): Promise<EditResponse> => {
    const formData = new FormData();
    formData.append('image', editRequest.image);
    formData.append('templateId', editRequest.templateId);

    const response = await this.request<EditResponse>('/edit', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary for FormData
      body: formData,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to edit image');
    }
    return response.data;
  }

  healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await this.request<{ status: string; timestamp: string }>('/health');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Health check failed');
      }
      return response.data;
    } catch (error) {
      // Fallback health check
      console.warn('Health check failed, using fallback');
      return {
        status: 'degraded',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Test API connectivity
  testConnection = async (): Promise<boolean> => {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
