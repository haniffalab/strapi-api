'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('ebi-ols')
      .service('myService')
      .getWelcomeMessage();
  },
});
