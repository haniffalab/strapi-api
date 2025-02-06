'use strict';

/**
 *  dataset controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');

module.exports = createCoreController('api::dataset.dataset', ({ strapi }) => ({
  async find(ctx) {

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { populate: { datasets: { select: ['id'] } } } }
      });
      
      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id));
      if (!ids?.length) { return this.transformResponse([]); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

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

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { populate: { datasets: { select: ['id'] } } } }
      });

      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id));
      if (!ids?.length) { return this.transformResponse([]); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    const datasets = await strapi.entityService.findMany('api::dataset.dataset', {
      fields: ['tissues'],
      populate: {
        study: {
          fields: ['slug'],
        }
      },
      filters: ctx.query.filters,
    });

    const tissues = _.values(_.reduce(datasets, (res, d) => {
      _.forEach(d.tissues, t => {
        var compositeId = `${t.id}-${t.label}`;
        if (!res[compositeId]) {
          res[compositeId] = { ...t, datasets: [], studies: [] };
        }
        if (!res[compositeId].datasets.includes(d.id)) {
          res[compositeId].datasets.push(d.id);
        }
        if (!res[compositeId].studies.includes(d.study.slug)) {
          res[compositeId].studies.push(d.study.slug);
        }
      });
      return res;
    }, {}));

    return this.transformResponse(tissues);
  }
}));