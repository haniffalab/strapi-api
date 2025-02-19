module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tissues',
      handler: 'api::dataset.dataset.findTissues',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/organisms',
      handler: 'api::dataset.dataset.findOrganisms',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/assays',
      handler: 'api::dataset.dataset.findAssays',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/diseases',
      handler: 'api::dataset.dataset.findDiseases',
      config: {
        auth: false,
      },
    }
  ]
};