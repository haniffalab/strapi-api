'use strict';

/**
 * journal controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::journal.journal', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: false
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: false
    };
    return await super.findOne(ctx);
  }
}));
