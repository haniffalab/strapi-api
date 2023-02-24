'use strict';

/**
 * method service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::method.method');
