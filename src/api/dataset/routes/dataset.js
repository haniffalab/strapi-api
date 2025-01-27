'use strict';

/**
 * dataset router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::dataset.dataset',{
  config: {
    findOne: {
      policies: ['api::dataset.password'],
    },
  }
});
