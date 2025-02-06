'use strict';

/**
 * disease-gene service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::disease-gene.disease-gene', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::disease-gene.disease-gene';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const { disease_gene, disease_id, gene_id } = ctx.params;

    let where;
    if (!disease_gene){
      where = { disease_id: disease_id, gene_id: gene_id };
    }
    else {
      where = { disease_gene: disease_gene };
    }

    const populateParams = strapi.config.functions.getPopulateParams(attrs);

    let entity = await strapi.db.query(ctUid).findOne({
      where: where,
      populate: populateParams
    });

    if (entity){
      entity = strapi.config.functions.reduceComponentData(attrs, entity);
    }

    return entity;
  }
}));
