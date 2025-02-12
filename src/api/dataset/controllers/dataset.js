'use strict';

/**
 *  dataset controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { NotFoundError } = require('@strapi/utils').errors;
const _ = require('lodash');

const findTerms = async (ctx, ontologyField) => {
  // Check if 'collection' query parameter is present
  const { collection } = ctx.query;
  if (collection) {
    const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
      where: { name: collection },
      populate: { studies: { populate: { datasets: { select: ['id'] } } } }
    });

    const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id)) || [];
    if (!ids?.length) { return []; }

    ctx.query.filters = {
      ...ctx.query.filters,
      id: { $in: ids },
    };
  }

  const datasets = await strapi.entityService.findMany('api::dataset.dataset', {
    fields: [ontologyField],
    populate: {
      study: {
        fields: ['slug'],
      }
    },
    filters: ctx.query.filters,
  });

  const terms = _.values(_.reduce(datasets, (res, d) => {
    _.forEach(d[ontologyField], t => {
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

  return terms;
};

module.exports = createCoreController('api::dataset.dataset', ({ strapi }) => ({
  async find(ctx) {

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { populate: { datasets: { select: ['id'] } } } }
      });

      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id)) || [];
      if (!ids?.length) { return this.transformResponse([]); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    ctx.query = {
      ...ctx.query,
      fields: [
        'name', 'category', 'tissues', 'organisms', 'assays', 'diseases'
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
        'name', 'category', 'tissues', 'organisms', 'assays', 'diseases'
      ],
      populate: {
        study: {
          fields: ['name', 'slug'],
        },
        data: true,
      }
    };
    const dataset = await super.findOne(ctx);

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { populate: { datasets: { select: ['id'] } } } }
      });

      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id)) || [];
      if (!ids.length || !ids.includes(dataset.id)) {
        throw new NotFoundError('Dataset not found in collection');
      }
    }
    return dataset;
  },
  async findTissues(ctx) {
    const tissues = await findTerms(ctx, 'tissues');
    return this.transformResponse(tissues);
  },
  async findOrganisms(ctx) {
    const organisms = await findTerms(ctx, 'organisms');
    return this.transformResponse(organisms);
  },
  async findAssays(ctx) {
    const assays = await findTerms(ctx, 'assays');
    return this.transformResponse(assays);
  },
  async findDiseases(ctx) {
    const diseases = await findTerms(ctx, 'diseases');
    return this.transformResponse(diseases);
  },
}));