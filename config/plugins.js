module.exports = ({ env }) => ({
  'ebi-ols': {
    enabled: true,
    resolve: './src/plugins/ebi-ols',
    config: {
      baseUrl: 'https://www.ebi.ac.uk/ols/',
    },
  },
  'data-import': {
    enabled: true,
    resolve: './src/plugins/data-import'
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: '',
      },
      settings: {
        defaultFrom: 'no-reply@cellatlas.io',
        defaultReplyTo: 'no-reply@cellatlas.io',
      },
    },
  },
});
