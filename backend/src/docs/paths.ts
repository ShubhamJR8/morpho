// import { PathsObject } from 'swagger-jsdoc';

// Define PathsObject type locally
type PathsObject = any;

const paths: PathsObject = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Returns the health status of the API service',
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HealthResponse'
              },
              example: {
                status: 'healthy',
                timestamp: '2023-12-01T10:00:00.000Z',
                service: 'ai-style-editor-backend',
                version: '1.0.0'
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        }
      }
    }
  },
  '/api/templates': {
    get: {
      tags: ['Templates'],
      summary: 'Get all templates',
      description: 'Retrieves all available image editing templates',
      responses: {
        '200': {
          description: 'Templates retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                ]
              },
              example: {
                success: true,
                data: [
                  {
                    id: 't1',
                    title: 'Vintage Film Noir',
                    previewUrl: 'https://example.com/preview1.jpg',
                    description: 'Classic black and white film noir style',
                    category: 'Vintage'
                  }
                ],
                message: 'Templates retrieved successfully'
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/templates/{id}': {
    get: {
      tags: ['Templates'],
      summary: 'Get template by ID',
      description: 'Retrieves a specific template by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Template ID',
          schema: {
            type: 'string',
            example: 't1'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Template retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Template' }
                    }
                  }
                ]
              }
            }
          }
        },
        '404': {
          $ref: '#/components/responses/NotFound'
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/templates/categories': {
    get: {
      tags: ['Templates'],
      summary: 'Get all categories',
      description: 'Retrieves all available template categories',
      responses: {
        '200': {
          description: 'Categories retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                ]
              },
              example: {
                success: true,
                data: ['Fantasy', 'Sci-Fi', 'Vintage', 'Artistic', 'Nature'],
                message: 'Categories retrieved successfully'
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/templates/category/{category}': {
    get: {
      tags: ['Templates'],
      summary: 'Get templates by category',
      description: 'Retrieves all templates in a specific category',
      parameters: [
        {
          name: 'category',
          in: 'path',
          required: true,
          description: 'Category name',
          schema: {
            type: 'string',
            example: 'Fantasy'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Templates retrieved successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/templates/search': {
    get: {
      tags: ['Templates'],
      summary: 'Search templates',
      description: 'Search templates by query string with optional category filter',
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: true,
          description: 'Search query',
          schema: {
            type: 'string',
            example: 'vintage'
          }
        },
        {
          name: 'category',
          in: 'query',
          required: false,
          description: 'Filter by category',
          schema: {
            type: 'string',
            example: 'Fantasy'
          }
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Maximum number of results',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            example: 10
          }
        }
      ],
      responses: {
        '200': {
          description: 'Search completed successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Template' }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/edit': {
    post: {
      tags: ['Image Editing'],
      summary: 'Edit image with AI',
      description: 'Apply a template style to an uploaded image using AI',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/EditRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Image edited successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/EditResponse' }
                    }
                  }
                ]
              },
              example: {
                success: true,
                data: {
                  success: true,
                  imageUrl: 'https://s3.amazonaws.com/bucket/generated/result.jpg',
                  processingTime: 2500
                },
                message: 'Image edited successfully'
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing file or template ID',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: false,
                error: 'No image file provided',
                code: 'VALIDATION_ERROR',
                timestamp: '2023-12-01T10:00:00.000Z',
                path: '/api/edit'
              }
            }
          }
        },
        '404': {
          description: 'Template not found',
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
                path: '/api/edit'
              }
            }
          }
        },
        '422': {
          description: 'File processing error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: false,
                error: 'File processing error: Invalid image file',
                code: 'FILE_PROCESSING_ERROR',
                timestamp: '2023-12-01T10:00:00.000Z',
                path: '/api/edit'
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/TooManyRequests'
        },
        '500': {
          description: 'Internal server error or external service error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              },
              example: {
                success: false,
                error: 'Failed to edit image',
                code: 'INTERNAL_ERROR',
                timestamp: '2023-12-01T10:00:00.000Z',
                path: '/api/edit'
              }
            }
          }
        }
      }
    }
  }
};

export default paths;
