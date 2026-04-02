import path from 'path';
import type { Application, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config/config';

const _ext = __filename.endsWith('.ts') ? 'ts' : 'js';
const _apisRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');
const _apisGlob = `${_apisRoot}/**/*.${_ext}`;

//  Generates the OpenAPI (Swagger) specification used by Swagger UI.
const swaggerSpec = swaggerJsdoc({
  definition: {
    //  OpenAPI 3.0 is the standard supported by Swagger UI.
    openapi: '3.0.0',
    //  Basic metadata shown at the top of the Swagger UI page.
    info: {
      title: 'Team desk API',
      version: '1.0.0',
      description: 'API documentation for the Team desk API service',
    },
    //  Base server URL, Example: /api/v1
    servers: [
      {
        url: '/api/',
      },
    ],
    //  MAKES authenticate() WORK IN SWAGGER
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase JWT access token',
        },
      },
      schemas: {
       
      },
    },
  },
  apis: [_apisGlob],
});

/**
 * Registers Swagger UI
 *
 * - `/api/docs`      → Swagger UI HTML (CDN-hosted assets — works in serverless / Cloud Run)
 * - `/api/docs.json` → Raw OpenAPI JSON spec
 *
 * Disabled in production unless SWAGGER_ALLOW_IN_PROD=true.
 */
export function setupSwagger(app: Application): void {
  if (config.NODE_ENV === 'production' && !config.SWAGGER_ALLOW_IN_PROD) {
    return;
  }

  // Serve the raw OpenAPI spec so the UI (and external tools) can consume it.
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Self-contained HTML page that loads Swagger UI from a CDN.
  // Avoids the MIME-type issues that swagger-ui-express causes in serverless
  // environments (Vercel, Cloud Run) where its static file serving returns
  // text/html instead of the correct CSS/JS MIME types.

  const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Team desk – API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script src="/api/docs/swagger-ui-init.js"></script>
</body>
</html>`;

  app.get('/api/docs/swagger-ui-init.js', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(
      `window.onload = function () {
  SwaggerUIBundle({
    url: '/api/docs.json',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
    persistAuthorization: true,
  });
};`
    );
  });

  app.get('/api/docs', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(swaggerHtml);
  });
}
