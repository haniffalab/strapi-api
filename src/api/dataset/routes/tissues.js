module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/tissues',
      handler: 'api::dataset.dataset.findTissues',
      config: {
        auth: false,
      },
    }
  ]
};