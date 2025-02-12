'use strict';
const array = require('lodash/array');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

module.exports = {
  // TODO: move function to data-import plugin
  getPopulateParams(attrs) {
    // Specify repeatable components attributes to populate
    const repComponentFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === 'component' && attrs[k].repeatable);

    const repComponentsPopulate = Object.fromEntries(repComponentFields.map(k => 
      [k, {populate: 
        Object.fromEntries(
          Object.keys(strapi.components[attrs[k].component].__schema__.attributes)
            .map(a => 
              strapi.components[attrs[k].component].__schema__.attributes[a].type === 'relation' ?
                [a, { select: ['id'] }] : // only get id for relation fields
                [a, true] // populate all other attributes
            )
        )
      }]
    ));

    const nonRCFields = array.difference(Object.keys(attrs), repComponentFields);
    const nonRCPopulate = Object.fromEntries(nonRCFields.map(k => [k, true]));

    return { ...nonRCPopulate, ...repComponentsPopulate };
  },

  // TODO: move function to data-import plugin
  reduceComponentData(attrs, entity){
    // Remove component 'id' and simplify relations' objects to id only
    const repComponentFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === 'component' && attrs[k].repeatable);

    for (const idx in repComponentFields){
      const f = repComponentFields[idx];
      const componentAttrs = strapi.components[attrs[f].component].__schema__.attributes;
      const relAttrs = Object.keys(componentAttrs)
        .filter((a) => componentAttrs[a].type === 'relation');

      // Loop through the entity's component's data
      for (const c in entity[f]){
        for (const attrIdx in relAttrs){
          const a = relAttrs[attrIdx];
          if (componentAttrs[a].relation === 'manyToMany' ||
            componentAttrs[a].relation === 'oneToMany') {
            // Map array of objects to ids
            entity[f][c][a] = entity[f][c][a].map((i) => i.id);
          }
          else { entity[f][c][a] = entity[f][c][a].id; }
        }

        delete entity[f][c].id;
      }
    }

    return entity;
  },

  async validateStudyAccess(study, request){
    const { password: studyPassword } = study;

    if (studyPassword) {
      const authHeader = request.header['authorization'];

      if (!authHeader) {
        return 'Authorization header is required';
      }

      const [authType, authValue] = authHeader.split(' ');
  
      if (authType === 'Basic') {
        const base64Credentials = authHeader.split(' ')[1];
        const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [_, password] = decodedCredentials.split(':');
  
        if (!password) {
          return 'Password is required';
        }
  
        const validPassword = await bcrypt.compare(password, studyPassword);
        if (!validPassword) {
          return 'Invalid password';
        }
      }
      else if (authType === 'Bearer') {
        const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(authValue);
        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: { id },
          populate: { user_groups: {
            populate: { studies: { select: ['id', 'slug'] } }
          } } 
        });
  
        if (!user) {
          return 'Invalid token';
        }
        
        const hasUserGroupAccess = user.user_groups.some(group =>
          group.studies.some(group_study => group_study.id === study.id && group_study.slug === study.slug)
        );
  
        if (!hasUserGroupAccess) {
          return 'User does not have access to study';
        }
      }
      else {
        return 'Invalid authorization';
      }
    }
  },

  async findTerms(ctx, ontologyField){
    // Check if 'collection' query parameter is present
    const { collection } = ctx.query;
    if (collection) {
      const collectionEntry = await strapi.db.query('api::collection.collection').findOne({
        where: { name: collection },
        populate: { studies: { populate: { datasets: { select: ['id'] } } } }
      });
    
      const ids = _.flatMap(collectionEntry?.studies, s => s.datasets.map(d => d.id)) || [];
      if (!ids?.length) { return []; }
    
      ctx.query.filters = {
        ...ctx.query.filters,
        id: { $in: ids },
      };
    }
    
    const datasets = await strapi.entityService.findMany('api::dataset.dataset', {
      fields: [ontologyField],
      populate: {
        study: {
          fields: ['slug'],
        }
      },
      filters: ctx.query.filters,
    });
    
    const terms = _.values(_.reduce(datasets, (res, d) => {
      _.forEach(d[ontologyField], t => {
        var compositeId = `${t.id}-${t.label}`;
        if (!res[compositeId]) {
          res[compositeId] = { ...t, datasets: [], studies: [] };
        }
        if (!res[compositeId].datasets.includes(d.id)) {
          res[compositeId].datasets.push(d.id);
        }
        if (!res[compositeId].studies.includes(d.study.slug)) {
          res[compositeId].studies.push(d.study.slug);
        }
      });
      return res;
    }, {}));
    
    return terms;
  }
};