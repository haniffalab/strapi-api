'use strict';

const { ApplicationError } = require('@strapi/utils').errors;
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
    console.log('Missing required fields', array.difference(requiredFields, Object.keys(entry)));
    throw new ApplicationError('Missing required fields', {data: array.difference(requiredFields, Object.keys(entry))});
  }

  // Loop through nonrelational fields and validate their types
  const ctNonrelationFields = Object.keys(attrs).filter((k) => attrs[k].type !== 'relation');
  try {
    await strapi.entityValidator.validateEntityCreation(strapi.contentTypes[uid], object.pick(entry, ctNonrelationFields), {strict: false});
  } catch (error){
    const errors = error.details.errors.filter((e) => e.path != ['uid'] && e.message !== 'uid must be defined.' && e.message !== 'Invalid relations');
    if (errors.length){
      console.log('Invalid values', {errors});
      throw new ApplicationError('Invalid values', {errors});
    }
  }

  // Loop trough 'relation' fields and validate them as entries
  const ctRelationFields = Object.keys(attrs).filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  relationData.forEach((r)=>{
    if (attrs[r].relation === 'manyToMany' || attrs[r].relation === 'oneToMany'){
      validateData(attrs[r].target, entry[r]);
    }
    else if (attrs[r].relation === 'oneToOne'){
      validateEntry(attrs[r].target,entry[r]);
    }
  });

  // Loop through 'component' fields
  const componentFields = Object.keys(attrs).filter((k) => attrs[k].type === 'component');
  const componentData = array.intersection(Object.keys(entry), componentFields);
  componentData.forEach((component)=>{
    if (!attrs[component].repeatable){
      validateEntry(attrs[component].component, entry[component], is_component=true);
    }
    else {
      entry[component].forEach((c)=>{
        validateEntry(attrs[component].component, c, is_component=true);
      });
    }
  });

};

const validateData = (uid, entries) => {
  
  entries.forEach((entry) => {
    validateEntry(uid, entry);
  });
  
    
};

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    for (const [key, entries] of Object.entries(data.data)) {
      const uid = Object.keys(strapi.contentTypes).filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      validateData(uid, entries);
    }

    console.log('Stopping');
    throw new ApplicationError('stop');
  },

};