'use strict';

/**
 * method controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::method.method');
