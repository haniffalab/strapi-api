'use strict';

/**
 * donor service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::donor.donor', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::donor.donor';
    const attrs = strapi.contentTypes[ctUid].__schema__.attributes;
    const uidTarget =attrs['uid'].targetField;
    const { [uidTarget]: uidTargetValue } = ctx.params;
    
    const entity = await strapi.db.query(ctUid).findOne({
      where: { [uidTarget]: uidTargetValue },
      populate: true
    });

    return entity;
  }
}));
