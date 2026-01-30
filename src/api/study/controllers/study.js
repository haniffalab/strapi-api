'use strict';

/**
 *  study controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { NotFoundError } = require('@strapi/utils').errors;

module.exports = createCoreController('api::study.study', ({ strapi }) => ({
  async find(ctx) {
    // If not providing a dataset id, return only studies that are listed
    if (!ctx.query.filters?.datasets?.id?.$eq) {
      ctx.query.filters = {
        ...ctx.query.filters,
        is_listed: true,
      };
    }

    ctx.query = {
      ...ctx.query,
      fields: ['name', 'slug', 'lay_summary', 'createdAt', 'updatedAt'],
      populate: {
        cover_image: true,
        publications: {
          fields: [
            'title',
            'doi',
            'url',
            'abstract',
            'date',
            'is_published',
            'is_preprint',
          ],
          populate: {
            journal: {
              fields: ['name'],
              populate: ['logo'],
            },
          },
        },
        teams: {
          fields: ['is_lead'],
          filters: { team: { publishedAt: { $notNull: true } } },
          populate: {
            team: {
              fields: ['name', 'website', 'description'],
              populate: ['logo'],
            },
          },
        },
        contributors: {
          fields: ['is_lead', 'role'],
          filters: { person: { publishedAt: { $notNull: true } } },
          populate: {
            person: {
              fields: ['first_name', 'last_name'],
              populate: ['avatar'],
            },
          },
        },
        datasets: {
          fields: [
            'name',
            'description',
            'tissues',
            'organisms',
            'assays',
            'diseases',
            'celltypes',
            'human_developmental_stages',
            'count',
            'unit',
          ],
          populate: ['media'],
        },
        resources: {
          fields: ['name', 'description', 'type', 'category'],
        },
        cover_dataset: {
          fields: ['id'],
          populate: ['media'],
        },
      },
    };

    // Check if 'collection' query parameter is present
    // Add to query filters last to avoid spreading the ids array into an object
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db
        .query('api::collection.collection')
        .findOne({
          where: { name: collection },
          populate: { studies: { select: ['id'] } },
        });

      const ids = collectionEntry?.studies.map(({ id }) => id) || [];
      if (!ids?.length) {
        return this.transformResponse([], {
          pagination: {
            page: 1,
            total: 0,
            pageCount: 0,
            pageSize: ctx.query.pagination?.pageSize || 10,
          },
        });
      }

      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }

    // If sorting by publication date, get studies and manually sort
    // as nested sorting returns duplicates (https://github.com/strapi/strapi/issues/11892)
    const [sort, order = 'asc'] = ctx.query.sort?.split(':') || [];
    if (sort === 'publications.date') {
      const studiesDates = await strapi.entityService.findMany(
        'api::study.study',
        {
          fields: ['id'],
          populate: {
            publications: { fields: ['date'] },
          },
          filters: ctx.query.filters,
        }
      );

      studiesDates.sort((a, b) => {
        const aLatest = Math.max(
          ...(a.publications || []).map((p) => new Date(p.date)),
          0
        );
        const bLatest = Math.max(
          ...(b.publications || []).map((p) => new Date(p.date)),
          0
        );
        return order === 'asc' ? aLatest - bLatest : bLatest - aLatest;
      });

      const { results: paginatedStudiesDates, meta } =
        strapi.config.functions.paginate(studiesDates, ctx.query.pagination || {});

      const paginatedIds = paginatedStudiesDates.map((s) => s.id);

      let studies = await strapi.entityService.findMany('api::study.study', {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          id: { $in: paginatedIds },
        },
        sort: null,
      });

      studies = paginatedIds.map((id) => studies.find((s) => s.id === id));

      return this.transformResponse(studies, meta);
    }

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
        'lay_summary',
        'cover_video',
        'landing_page',
        'createdAt',
        'updatedAt',
      ],
      populate: {
        cover_image: true,
        cover_video: true,
        publications: {
          fields: [
            'title',
            'doi',
            'url',
            'abstract',
            'date',
            'is_published',
            'is_preprint',
          ],
          populate: {
            journal: {
              fields: ['name'],
              populate: ['logo'],
            },
          },
        },
        teams: {
          fields: ['is_lead'],
          filters: { team: { publishedAt: { $notNull: true } } },
          populate: {
            team: {
              fields: ['name', 'website', 'description'],
              populate: ['logo'],
            },
          },
        },
        contributors: {
          fields: ['is_lead', 'role'],
          filters: { person: { publishedAt: { $notNull: true } } },
          populate: {
            person: {
              fields: [
                'first_name',
                'last_name',
                'full_name',
                'email',
                'orcid_id',
                'position',
              ],
              populate: {
                avatar: true,
                team: {
                  fields: ['name', 'website'],
                },
              },
            },
          },
        },
        datasets: {
          fields: [
            'name',
            'description',
            'tissues',
            'organisms',
            'assays',
            'diseases',
            'celltypes',
            'human_developmental_stages',
            'count',
            'is_featured',
            'unit',
          ],
          populate: ['media', 'data', 'resources'],
        },
        resources: true,
        media: { fields: ['title', 'type'], populate: ['file'] },
        cover_dataset: {
          fields: [],
          populate: ['media'],
        },
      },
    };

    const [study] = await strapi.entityService.findMany(
      'api::study.study',
      query
    );

    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db
        .query('api::collection.collection')
        .findOne({
          where: { name: collection },
          populate: { studies: { select: ['id'] } },
        });

      const ids = collectionEntry?.studies.map(({ id }) => id) || [];
      if (!ids.length || !ids.includes(study.id)) {
        throw new NotFoundError('Study not found in collection');
      }
    }

    return this.transformResponse(study);
  },
}));
