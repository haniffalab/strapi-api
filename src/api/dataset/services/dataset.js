'use strict';

/**
 * dataset service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dataset.dataset', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::dataset.dataset';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const { dataset_id, name, study_id } = ctx.params;

    let where;
    if (dataset_id){
      where = { dataset_id: dataset_id };
    }
    else {
      const studyEntry = await strapi.service('api::study.study').findByUid({params: {study_id: study_id}});
      where = { study: studyEntry?.id || null, name: name };
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
