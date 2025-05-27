'use strict';

/**
 *  study controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { NotFoundError } = require('@strapi/utils').errors;

module.exports = createCoreController('api::study.study', ({ strapi }) => ({
  async find(ctx) {

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { select: ['id'] } },
      });

      const ids = collectionEntry?.studies.map(({ id }) => id) || [];
      if (!ids?.length) { return this.transformResponse([], {
        pagination: { page: 1, total: 0, pageCount: 0, pageSize: ctx.query.pagination?.pageSize || 10 }
      }); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    ctx.query.filters = {
      ...ctx.query.filters,
      is_listed: true,
    };

    ctx.query = {
      ...ctx.query,
      fields: [
        'name',
        'slug',
        'subtitle',
        'createdAt',
        'updatedAt',
      ],
      populate: {
        cover_image: true,
        publications: {
          fields: ['title', 'doi', 'url', 'abstract', 'date', 'is_published', 'is_preprint'],
          populate: {
            journal: {
              fields: ['name'],
              populate: ['logo'],
            },
          },
        },
        teams: {
          fields: ['is_lead'],
          populate: {
            team: {
              fields: ['name', 'website', 'description'],
              populate: ['logo'],
            },
          },
        },
        contributors: {
          fields: ['is_lead', 'role'],
          populate: {
            person: {
              fields: ['first_name', 'last_name'],
              populate: ['avatar'],
            },
          },
        },
        datasets: {
          fields: ['name', 'description', 'tissues', 'organisms', 'assays', 'diseases', 'celltypes', 'human_developmental_stages', 'count', 'unit'],
          populate: ['media'],
        },
        resources: {
          fields: ['name', 'description', 'type', 'category' ]
        }
      },
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {

    const { slug } = ctx.params;

    const query = {
      ...ctx.query,
      filters: { slug },
      fields: [
        'name',
        'slug',
        'subtitle',
        'createdAt',
        'updatedAt',
      ],
      populate: {
        cover_image: true,
        publications: {
          fields: ['title', 'doi', 'url', 'abstract', 'date', 'is_published', 'is_preprint'],
          populate: {
            journal: {
              fields: ['name'],
              populate: ['logo'],
            },
          },
        },
        teams: {
          fields: ['is_lead'],
          populate: {
            team: {
              fields: ['name', 'website', 'description'],
              populate: ['logo'],
            },
          },
        },
        contributors: {
          fields: ['is_lead', 'role'],
          populate: {
            person: {
              fields: ['first_name', 'last_name'],
              populate: ['avatar'],
            },
          },
        },
        datasets: {
          fields: ['name', 'description', 'tissues', 'organisms', 'assays', 'diseases', 'celltypes', 'human_developmental_stages', 'count', 'unit'],
          populate: ['media', 'data', 'resources'],
        },
        resources: true
      },
    };

    const [study] = await strapi.entityService.findMany(
      'api::study.study',
      query
    );

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { select: ['id'] } },
      });

      const ids = collectionEntry?.studies.map(({ id }) => id) || [];
      if (!ids.length || !ids.includes(study.id)){
        throw new NotFoundError('Study not found in collection');
      }
    }

    return this.transformResponse(study);
  },
}));