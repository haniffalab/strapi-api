'use strict';

/**
 * protocol controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::protocol.protocol', ({ strapi }) => ({
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
