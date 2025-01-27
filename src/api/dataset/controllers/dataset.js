'use strict';

/**
 *  dataset controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dataset.dataset', ({ strapi }) => ({
  async find(ctx) {
    const query = {
      ...ctx.query,
    };

    const { results: datasets, pagination } =
      await strapi.entityService.findPage('api::dataset.dataset', {
        ...query.pagination,
        sort: query.sort,
        filters: query.filters,
        fields: [
          'name', 'category', 'tissues', 'organisms'
        ],
        populate: {
          study: {
            fields: ['name', 'slug'],
          }
        }
      });

    return this.transformResponse(datasets, { pagination });
  },
  async findOne(ctx) {
    const {id} = ctx.params;

    const dataset = await strapi.entityService.findOne('api::dataset.dataset', id, {
      fields: [
        'name', 'category', 'tissues', 'organisms',
      ],
      populate: {
        study: {
          fields: ['name', 'slug'],
        },
        data: true,
      }
    });

    return this.transformResponse(dataset);
  }
}));
