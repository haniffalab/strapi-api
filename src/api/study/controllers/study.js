'use strict';

/**
 *  study controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::study.study', ({ strapi }) => ({
  async find(ctx) {
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

    const [study, ..._] = await strapi.entityService.findMany(
      'api::study.study',
      query
    );

    return this.transformResponse(study);
  },
}));
