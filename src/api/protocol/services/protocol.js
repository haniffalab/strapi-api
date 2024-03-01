'use strict';

/**
 * protocol service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::protocol.protocol', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::protocol.protocol';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const uidTarget =attrs['uid'].targetField;
    const { [uidTarget]: uidTargetValue } = ctx.params;
    
    const populateParams = strapi.config.functions.getPopulateParams(attrs);
    
    let entity = await strapi.db.query(ctUid).findOne({
      where: { [uidTarget]: uidTargetValue },
      populate: populateParams
    });

    entity = strapi.config.functions.reduceComponentData(attrs, entity);

    return entity;
  }
}));
