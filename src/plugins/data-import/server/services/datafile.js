'use strict';

/**
 *  service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('plugin::data-import.datafile', ({strapi}) => ({

  async create(ctx) {
    console.log('CREATE SERVICE');
    console.log(ctx);

    strapi.log.debug(ctx);
    const response = await super.create(ctx);
    return response;
  }
}));
