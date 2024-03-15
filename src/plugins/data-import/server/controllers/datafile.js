'use strict';

/**
 *  controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::data-import.datafile', ({strapi}) => ({

  async create(ctx) {
    strapi.log.debug(ctx);
    const response = await super.create(ctx);
    return response;
  }
})
);