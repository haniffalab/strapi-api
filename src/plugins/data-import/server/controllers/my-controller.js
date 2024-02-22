'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('data-import')
      .service('myService')
      .getWelcomeMessage();
  },
});
