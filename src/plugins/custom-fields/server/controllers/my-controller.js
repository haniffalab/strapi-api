'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('custom-fields')
      .service('myService')
      .getWelcomeMessage();
  },
});
