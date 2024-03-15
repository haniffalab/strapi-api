'use strict';

/**
 *  controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::data-import.data-import');
