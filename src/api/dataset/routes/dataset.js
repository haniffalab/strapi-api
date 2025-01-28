'use strict';

/**
 * dataset router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::dataset.dataset',{
  only: ['find', 'findOne'],
  config: {
    findOne: {
      policies: ['api::dataset.password'],
    },
  }
});
