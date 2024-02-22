module.exports = {
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
};