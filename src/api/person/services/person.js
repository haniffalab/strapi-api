'use strict';

/**
 * person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::person.person', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::person.person';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const { full_name, first_name, last_name } = ctx.params;
    
    let where;
    if (!full_name){
      where = { first_name: first_name, last_name: last_name };
    }
    else {
      where = { full_name: full_name };
    }

    const populateParams = strapi.config.functions.getPopulateParams(attrs);
    
    let entity = await strapi.db.query(ctUid).findOne({
      where: where,
      populate: populateParams
    });

    entity = strapi.config.functions.reduceComponentData(attrs, entity);

    return entity;
  }
}));
