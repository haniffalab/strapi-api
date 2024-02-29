'use strict';

/**
 * sample service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sample.sample', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::sample.sample';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const uidTarget = attrs['uid'].targetField;
    console.log('uidTarget', uidTarget);
    const { [uidTarget]: uidTargetValue } = ctx.params;
    
    const entity = await strapi.db.query(ctUid).findOne({
      where: { [uidTarget]: uidTargetValue },
      populate: true
    });

    console.log('entity', entity);
    return entity;
  }
}));
