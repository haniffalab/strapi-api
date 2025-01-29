'use strict';

/**
 * disease-gene controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::disease-gene.disease-gene', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: ['organs']
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: ['organs']
    };
    return await super.findOne(ctx);
  }
}));
