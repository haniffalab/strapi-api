'use strict';

/**
 *  study controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::study.study', ({ strapi }) => ({
  async find(ctx) {

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { select: ['id'] } },
      });

      const ids = collectionEntry?.studies.map(({ id }) => id);
      if (!ids?.length) { return this.transformResponse([]); }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    ctx.query = {
      ...ctx.query,
      fields: [
        'name',
        'slug',
        'createdAt',
        'updatedAt',
        'view_count',
        'cell_count',
      ],
      populate: {
        cover_image: true,
        publications: {
          fields: ['title', 'doi', 'url'],
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
          fields: ['name', 'description', 'tissues', 'organisms', 'assays'],
        },
      },
    };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    // @TODO: check collection query parameter
    // and return 404 if not in collection
    const { slug } = ctx.params;

    const query = {
      ...ctx.query,
      filters: { slug },
      fields: [
        'name',
        'slug',
        'createdAt',
        'updatedAt',
        'view_count',
        'cell_count',
      ],
      populate: {
        cover_image: true,
        publications: {
          fields: ['title', 'doi', 'url'],
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
          fields: ['name', 'description', 'tissues', 'organisms', 'assays'],
        },
      },
    };

    const [study] = await strapi.entityService.findMany(
      'api::study.study',
      query
    );

    return this.transformResponse(study);
  },
}));
