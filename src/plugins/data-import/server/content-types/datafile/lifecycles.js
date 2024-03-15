'use strict';

const { ValidationError } = require('@strapi/utils').errors;
const { validateEntries } = require('./validation');
const { importEntries } = require('./import');


module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    console.log('Validating JSON');
    
    for (const [key, entries] of Object.entries(data.data)) {
      const uid = Object.keys(strapi.contentTypes)
        .filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      if (!uid){ throw new ValidationError('Invalid type ' + key); }
      await validateEntries(uid, entries, []).catch((e) => { throw e; });
    }

    console.log('Validated JSON');
  },

  async afterCreate(event) {
    const { result, params, model } = event;
    const {uid} = model;
    const {id} = result;
    const {data} = params;

    console.log('Importing JSON data');

    for (const [key, entries] of Object.entries(data.data)){
      const uid = Object.keys(strapi.contentTypes)
        .filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      await importEntries(uid, entries, id, data.publish_on_import)
        .catch((e) => { throw e; });
    }

    await strapi.entityService.update(uid, id, {
      data: {
        succeeded: true
      }
    }).catch((e) => { throw e; });

    console.log('Imported data');

    

  }

};