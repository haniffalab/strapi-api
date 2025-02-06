'use strict';

/**
 * disease-dataset router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::disease-dataset.disease-dataset', {
  only: ['find', 'findOne'],
});
