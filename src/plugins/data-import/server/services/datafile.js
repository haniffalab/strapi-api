'use strict';

/**
 *  service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('plugin::data-import.datafile', ({strapi}) => ({

  async create(ctx) {
    strapi.log.debug(ctx);
    const response = await super.create(ctx);
    return response;
  }
}));
