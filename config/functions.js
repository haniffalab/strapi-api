'use strict';

const array = require('lodash/array');

module.exports = {
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
  }
};