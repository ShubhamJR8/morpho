import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AI Style Editor API',
    version: '1.0.0',
    description: 'Backend API for AI-powered image style editing application',
    contact: {
      name: 'AI Style Editor Team',
      email: 'support@aistyleeditor.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://api.aistyleeditor.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful'
          },
          data: {
            type: 'object',
            description: 'Response data (present when success is true)'
          },
          error: {
            type: 'string',
            description: 'Error message (present when success is false)'
          },
          message: {
            type: 'string',
            description: 'Additional message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp of the response'
          },
          path: {
            type: 'string',
            description: 'Request path'
          },
          requestId: {
            type: 'string',
            description: 'Unique request identifier'
          }
        },
        required: ['success']
      },
      Template: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique template identifier',
            example: 't1'
          },
          title: {
            type: 'string',
            description: 'Template title',
            example: 'Vintage Film Noir'
          },
          previewUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL to template preview image',
            example: 'https://example.com/preview.jpg'
          },
          description: {
            type: 'string',
            description: 'Template description',
            example: 'Classic black and white film noir style'
          },
          category: {
            type: 'string',
            description: 'Template category',
            example: 'Vintage'
          }
        },
        required: ['id', 'title', 'previewUrl']
      },
      EditRequest: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
            description: 'Image file to edit (JPEG, PNG, GIF, WebP)'
          },
          templateId: {
            type: 'string',
            description: 'Template ID to apply',
            example: 't1'
          }
        },
        required: ['image', 'templateId']
      },
      EditResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the edit was successful'
          },
          imageUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL to the edited image'
          },
          processingTime: {
            type: 'number',
            description: 'Processing time in milliseconds'
          },
          error: {
            type: 'string',
            description: 'Error message (if any)'
          }
        },
        required: ['success']
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Service health status',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Health check timestamp'
          },
          service: {
            type: 'string',
            description: 'Service name',
            example: 'ai-style-editor-backend'
          },
          version: {
            type: 'string',
            description: 'Service version',
            example: '1.0.0'
          }
        },
        required: ['status', 'timestamp', 'service']
      },
      ValidationError: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            description: 'Field that failed validation'
          },
          message: {
            type: 'string',
            description: 'Validation error message'
          },
          value: {
            type: 'string',
            description: 'Invalid value provided'
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request - validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              timestamp: '2023-12-01T10:00:00.000Z',
              path: '/api/templates/search',
              details: [
                {
                  field: 'q',
                  message: 'Search query is required'
                }
              ]
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: 'Template not found',
              code: 'NOT_FOUND',
              timestamp: '2023-12-01T10:00:00.000Z',
              path: '/api/templates/nonexistent'
            }
          }
        }
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: 'Too many requests from this IP, please try again later',
              code: 'RATE_LIMIT_EXCEEDED',
              timestamp: '2023-12-01T10:00:00.000Z',
              path: '/api/edit'
            }
          },
          headers: {
            'X-RateLimit-Limit': {
              description: 'Rate limit threshold',
              schema: {
                type: 'integer'
              }
            },
            'X-RateLimit-Remaining': {
              description: 'Remaining requests in current window',
              schema: {
                type: 'integer'
              }
            },
            'X-RateLimit-Reset': {
              description: 'Time when rate limit resets',
              schema: {
                type: 'integer'
              }
            },
            'Retry-After': {
              description: 'Seconds to wait before retrying',
              schema: {
                type: 'integer'
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiResponse'
            },
            example: {
              success: false,
              error: 'Internal server error',
              code: 'INTERNAL_ERROR',
              timestamp: '2023-12-01T10:00:00.000Z',
              path: '/api/templates'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Templates',
      description: 'Template management endpoints'
    },
    {
      name: 'Image Editing',
      description: 'AI-powered image editing endpoints'
    }
  ]
};

export default swaggerDefinition;
