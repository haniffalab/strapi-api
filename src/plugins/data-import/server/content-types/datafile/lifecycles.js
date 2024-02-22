'use strict';

const { ApplicationError, ValidationError } = require('@strapi/utils').errors;
const array = require('lodash/array');
const object = require('lodash/object');


const validateEntry = async (uid, entry, is_component=false) => {
  let attrs;
  if (!is_component){
    attrs = strapi.contentTypes[uid].__schema__.attributes;
  }
  else {
    attrs = strapi.components[uid].__schema__.attributes;
  }

  // Check all required fields are present except for 'uid' which gets automatically generated
  const requiredFields = Object.keys(attrs).filter((k) => attrs[k].required === true && k !== 'uid');

  // Throw error if a required field is missing
  if (requiredFields.length !== array.intersection(requiredFields, Object.keys(entry)).length){
    const missingFields = array.difference(requiredFields, Object.keys(entry));
    console.log('Missing required fields', missingFields);
    throw new ValidationError('Missing required fields ' + uid + ': ' + missingFields.join(', '), {missingFields: missingFields});
  }

  // Loop through nonrelational fields and validate their types
  const ctNonrelationFields = Object.keys(attrs).filter((k) => attrs[k].type !== 'relation');
  await strapi.entityValidator.validateEntityCreation(strapi.contentTypes[uid], object.pick(entry, ctNonrelationFields), {strict: false}).catch ((error) => {
    const errors = error.details.errors.filter((e) => e.path != ['uid'] && e.message !== 'uid must be defined.' && e.message !== 'Invalid relations');
    if (errors.length){
      console.log('Invalid values', {errors: errors});
      throw new ValidationError('Invalid values ' + errors.map(e => e.path.join('.') + ' '), {errors: errors});
    }
  });

  // Loop trough 'relation' fields and validate them as entries
  const ctRelationFields = Object.keys(attrs).filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  for (const idx in relationData){
    const r = relationData[idx];
    if (attrs[r].relation === 'manyToMany' || attrs[r].relation === 'oneToMany'){
      await validateData(attrs[r].target, entry[r]).catch((e) => {
        throw e;
      });
    }
    else if (attrs[r].relation === 'oneToOne'){
      await validateEntry(attrs[r].target,entry[r]).catch((e) => {
        throw e;
      });
    }
  }

  // Loop through 'component' fields
  const componentFields = Object.keys(attrs).filter((k) => attrs[k].type === 'component');
  const componentData = array.intersection(Object.keys(entry), componentFields);
  for (const cd in componentData){
    const component = componentData[cd];
    if (!attrs[component].repeatable){
      await validateEntry(attrs[component].component, entry[component], is_component=true).catch((e)=>{
        throw e;
      });
    }
    else { // component field contains an array
      for (const c in entry[component]){
        const comp = entry[component][c];
        await validateEntry(attrs[component].component, comp, is_component=true).catch((e)=>{
          throw e;
        });
      }
    }
  }

};

const validateData = async (uid, entries) => {
  
  for (const idx in entries){
    const entry = entries[idx];
    await validateEntry(uid, entry).catch((e) => {
      throw e;
    });
  }
   
};


module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    for (const [key, entries] of Object.entries(data.data)) {
      const uid = Object.keys(strapi.contentTypes).filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      await validateData(uid, entries).catch((e) => {
        throw e;
      });
    }

    console.log('Stopping');
    throw new ApplicationError('stop', {});
  },

};