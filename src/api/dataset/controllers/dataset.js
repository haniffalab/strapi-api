'use strict';

/**
 *  dataset controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { NotFoundError } = require('@strapi/utils').errors;
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

      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id)) || [];
      if (!ids?.length) { return this.transformResponse([], {
        pagination: { page: 1, total: 0, pageCount: 0, pageSize: ctx.query.pagination?.pageSize || 10 }
      }); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    // If not providing a study id, return only datasets from studies that are listed
    if (!ctx.query.filters?.study?.id?.$eq) {
      ctx.query.filters = {
        ...ctx.query.filters,
        study: {
          is_listed: true },
      };
    }

    ctx.query = {
      ...ctx.query,
      fields: [
        'name', 'tissues', 'organisms', 'assays', 'diseases', 'celltypes', 'human_developmental_stages', 'count', 'unit', 'description', 'is_featured'
      ],
      populate: {
        media: true,
        study: {
          fields: ['name', 'slug'],
        },
        data: {
          fields: ['name', 'type', 'is_primary_data']
        },
        resources: {
          fields: ['name', 'description', 'type', 'category', 'is_primary_data']
        }
      }
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {

    ctx.query = {
      ...ctx.query,
      fields: [
        'name', 'tissues', 'organisms', 'assays', 'diseases', 'celltypes', 'human_developmental_stages', 'count', 'unit', 'description', 'is_featured'
      ],
      populate: {
        media: true,
        study: {
          fields: ['name', 'slug'],
          populate: ['disease_datasets']
        },
        data: true,
        resources: true,
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
      // get id from dataset.data and not only dataset as its response from findOne and not entityService
      if (!ids.length || !ids.includes(dataset.data.id)) {
        throw new NotFoundError('Dataset not found in collection');
      }
    }
    return dataset;
  },
  async findTissues(ctx) {
    const tissues = await strapi.config.functions.findTerms(ctx, 'tissues');
    return this.transformResponse(tissues);
  },
  async findOrganisms(ctx) {
    const organisms = await strapi.config.functions.findTerms(ctx, 'organisms');
    return this.transformResponse(organisms);
  },
  async findAssays(ctx) {
    const assays = await strapi.config.functions.findTerms(ctx, 'assays');
    return this.transformResponse(assays);
  },
  async findDiseases(ctx) {
    const diseases = await strapi.config.functions.findTerms(ctx, 'diseases');
    return this.transformResponse(diseases);
  },
}));