'use strict';

/**
 * journal service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::journal.journal', ({strapi}) => ({
  async findByUid(ctx){
    const ctUid = 'api::journal.journal';
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
