module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/studies/:slug',
      handler: 'api::study.study.findOne',
      config: {
        policies: ['api::study.password'],
      },
    },
  ],
};
