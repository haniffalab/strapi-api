'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('test-ebi')
      .service('myService')
      .getWelcomeMessage();
  },
});
