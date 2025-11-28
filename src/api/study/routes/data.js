module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/studies/:slug/resource/:rid',
      handler: 'api::study.study.findResource',
      config: {
        policies: ['api::study.password'],
      },
    },
    {
      method: 'GET',
      path: '/studies/:slug/media/:mid',
      handler: 'api::study.study.findMedia',
      config: {
        policies: ['api::study.password'],
      },
    },
  ],
};
