import fs from 'fs';
import path from 'path';

// Define types locally
interface Template {
  id: string;
  title: string;
  previewUrl: string;
  prompt: string;
  description?: string;
  category?: string;
}

export class TemplateService {
  private templates: Template[] = [];

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    try {
      const templatesPath = path.join(__dirname, '../data/templates.json');
      const templatesData = fs.readFileSync(templatesPath, 'utf8');
      this.templates = JSON.parse(templatesData);
      console.log(`Loaded ${this.templates.length} templates`);
    } catch (error) {
      console.error('Error loading templates:', error);
      this.templates = [];
    }
  }

  getAllTemplates(): Omit<Template, 'prompt'>[] {
    return this.templates.map(template => {
      const { prompt, ...publicTemplate } = template;
      return publicTemplate;
    });
  }

  getTemplateById(id: string): Template | null {
    const template = this.templates.find(t => t.id === id);
    return template || null;
  }

  getTemplatePrompt(id: string): string | null {
    const template = this.templates.find(t => t.id === id);
    return template?.prompt || null;
  }

  getTemplatesByCategory(category: string): Omit<Template, 'prompt'>[] {
    return this.templates
      .filter(template => template.category === category)
      .map(template => ({
        ...template,
        prompt: undefined,
      })) as Omit<Template, 'prompt'>[];
  }

  getCategories(): string[] {
    const categories = this.templates
      .map(template => template.category)
      .filter((category, index, self) => category && self.indexOf(category) === index);
    return categories as string[];
  }

  searchTemplates(query: string, category?: string, limit: number = 20): Omit<Template, 'prompt'>[] {
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
      return [];
    }

    let filteredTemplates = this.templates;

    // Filter by category if provided
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Search in title, description, and category
    const searchResults = filteredTemplates.filter(template => {
      const title = template.title.toLowerCase();
      const description = template.description?.toLowerCase() || '';
      const templateCategory = template.category?.toLowerCase() || '';
      
      return title.includes(searchQuery) || 
             description.includes(searchQuery) || 
             templateCategory.includes(searchQuery);
    });

    // Sort by relevance (exact matches first, then partial matches)
    const sortedResults = searchResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact title matches first
      if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
      if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
      
      // Title starts with query
      if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
      if (bTitle.startsWith(searchQuery) && !aTitle.startsWith(searchQuery)) return 1;
      
      // Alphabetical order for same relevance
      return aTitle.localeCompare(bTitle);
    });

    // Remove prompt and limit results
    return sortedResults
      .slice(0, limit)
      .map(template => {
        const { prompt, ...publicTemplate } = template;
        return publicTemplate;
      });
  }
}
