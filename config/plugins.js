module.exports = ({ env }) => ({
  "custom-fields": {
    enabled: true,
    resolve: "./src/plugins/custom-fields",
  },
  "ebi-ols": {
    enabled: true,
    resolve: "./src/plugins/ebi-ols",
    config: {
      baseUrl: "https://www.ebi.ac.uk/ols/",
    },
  },
  "data-import": {
    enabled: true,
    resolve: "./src/plugins/data-import",
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "no-reply@cellatlas.io",
        defaultReplyTo: "no-reply@cellatlas.io",
      },
    },
  },
  upload: {
    config: {
      provider: "@strapi-community/strapi-provider-upload-google-cloud-storage",
      providerOptions: {
        bucketName: env("GCS_BUCKET_NAME"),
        publicFiles: env("GCS_PUBLIC_FILES"),
        uniform: env("GCS_UNIFORM"),
        serviceAccount: env.json("GCP_SERVICE_ACCOUNT"),
        baseUrl: env("GCS_BASE_URL"),
        basePath: env("GCS_BASE_PATH"),
      },
    },
  },
});
