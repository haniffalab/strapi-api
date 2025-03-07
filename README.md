[![deploy](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine.yml/badge.svg)](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine.yml)
[![deploy-dev](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine-dev.yml/badge.svg)](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine-dev.yml)

# Cherita Strapi API

A backend API powered by [Strapi](https://strapi.io/), designed to manage and serve content within the Cherita infrastructure. It provides structured data storage, API endpoints, and authentication for applications consuming Cherita's data.

## Installation
To install dependencies, run:

```sh
npm install
```

Then, copy `.env.example` to `.env` and update the environment variables accordingly.

## Development
To start the Strapi application in development mode (with auto-reload enabled):

```sh
npm run develop
```

This will launch the Strapi admin panel and expose API endpoints.

## Production
To start the Strapi application in production mode:

```sh
npm run start
```

Ensure that the `.env` file is properly configured before running in production.

## Building the Admin Panel
To build the Strapi admin panel for deployment:

```sh
npm run build
```

This command compiles the admin UI for production use.

## Deployment
The Cherita Strapi App is deployed using Google Cloud App Engine. The following GitHub Actions handle deployments:

- **Production Deployment:** [deploy](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine.yml)
- **Development Deployment:** [deploy-dev](https://github.com/haniffalab/cherita-strapi-app/actions/workflows/deploy-appengine-dev.yml)

### Environment Variables
The application requires several environment variables for configuration. Ensure these are set in your `.env` file:

```sh
APP_KEYS="your-app-keys"
API_TOKEN_SALT="your-api-token-salt"
ADMIN_JWT_SECRET="your-admin-jwt-secret"
JWT_SECRET="your-jwt-secret"
DATABASE_URL="your-database-url"
CLOUD_STORAGE_BUCKET="your-gcs-bucket-name"
SENDGRID_API_KEY="your-sendgrid-api-key"
```

## Useful Commands
Generate a base64-encoded service account key:
```sh
cat /your-service-account.json | base64 | tr -d '\n'
```

Generate a random encryption key:
```sh
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

