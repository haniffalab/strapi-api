'use strict';

const { ApplicationError, ValidationError } = require('@strapi/utils').errors;
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

    // Import should be moved to afterCreate
    console.log('Importing JSON data');

    const dummyId = 1; // should be datafile id obtained in afterCreate

    for (const [key, entries] of Object.entries(data.data)){
      const uid = Object.keys(strapi.contentTypes)
        .filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      await importEntries(uid, entries, dummyId).catch((e) => { throw e; });
    }

    console.log('Imported data');

    console.log('Stopping');
    throw new ApplicationError('stop', {});
  },

  async afterCreate(event){
    const { result, params } = event;
  }

};