#!/bin/sh

FILE="app.yaml"
/bin/cat <<EOM >$FILE
runtime: nodejs20
env: $APP_ENV
service: $APP_SERVICE
env_variables:
  HOST: $APP_HOST
  NODE_ENV: $NODE_ENV
  DATABASE_NAME: $DATABASE_NAME
  DATABASE_USER: $DATABASE_USER
  DATABASE_PASSWORD: $DATABASE_PASSWORD
  INSTANCE_CONNECTION_NAME: $INSTANCE_CONNECTION_NAME
  APP_KEYS: $APP_KEYS
  API_TOKEN_SALT: $API_TOKEN_SALT
  ADMIN_JWT_SECRET: $ADMIN_JWT_SECRET
  JWT_SECRET: $JWT_SECRET
  GCS_BUCKET_NAME: $GCS_BUCKET_NAME
  GCS_BASE_PATH: $GCS_BASE_PATH
  GCS_BASE_URL: $GCS_BASE_URL
  GCS_PUBLIC_FILES: $GCS_PUBLIC_FILES
  GCS_UNIFORM: $GCS_UNIFORM
  GCS_SERVICE_ACCOUNT: $GCS_SERVICE_ACCOUNT
automatic_scaling:
  min_instances: $MIN_INSTANCES
  max_instances: $MAX_INSTANCES
  target_cpu_utilization: $TARGET_CPU_UTILIZATION
beta_settings:
  cloud_sql_instances: $INSTANCE_CONNECTION_NAME
EOM
