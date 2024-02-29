'use strict';

/**
 * person service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::person.person', ({strapi}) => ({
  async findByUid(ctx){
    const { full_name, first_name, last_name } = ctx.params;
    let entity;
    if (!full_name){
      entity = await strapi.db.query('api::person.person').findOne({
        where: { first_name: first_name, last_name: last_name },
        populate: true
      });
    }
    else {
      entity = await strapi.db.query('api::person.person').findOne({
        where: { full_name: full_name },
        populate: true
      });
    }

    return entity;
  }
}));
