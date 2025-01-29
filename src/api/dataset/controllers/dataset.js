'use strict';

/**
 *  dataset controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');

module.exports = createCoreController('api::dataset.dataset', ({ strapi }) => ({
  async find(ctx) {
    ctx.query = {
      ...ctx.query,
      fields: [
        'name', 'category', 'tissues', 'organisms'
      ],
      populate: {
        study: {
          fields: ['name', 'slug'],
        }
      }
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      fields: [
        'name', 'category', 'tissues', 'organisms',
      ],
      populate: {
        study: {
          fields: ['name', 'slug'],
        },
        data: true,
      }
    };
    return await super.findOne(ctx);
  },
  async findTissues(ctx) {
    const datasets = await strapi.entityService.findMany('api::dataset.dataset', {
      fields: ['tissues'],
    });

    const tissues = _.compact(_.flatMap(datasets, (n) => n.tissues));

    return this.transformResponse(tissues);
  }
}));