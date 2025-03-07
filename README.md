[![deploy](https://github.com/haniffalab/strapi-api/actions/workflows/deploy-appengine.yml/badge.svg)](https://github.com/haniffalab/strapi-api/actions/workflows/deploy-appengine.yml)
[![deploy-dev](https://github.com/haniffalab/strapi-api/actions/workflows/deploy-appengine-dev.yml/badge.svg)](https://github.com/haniffalab/strapi-api/actions/workflows/deploy-appengine-dev.yml)

# @haniffalab/strapi-api

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html) (CLI) which lets you scaffold and manage your project in seconds.

### `install`

Install your Strapi application

```
npm install
```

Then copy `.env.example` to `.env`

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

```
npm run start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build)

```
npm run build
```

## Useful stuff

cat /your-service-account.json | base64 | tr -d '\n'
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"