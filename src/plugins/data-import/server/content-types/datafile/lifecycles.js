'use strict';

const { ApplicationError, ValidationError } = require('@strapi/utils').errors;
const array = require('lodash/array');
const object = require('lodash/object');


const validateEntry = async (uid, entry, parents, is_component=false) => {
  parents.push(uid);

  if (Array.isArray(entry)){
    throw new ValidationError(parents.join('>') +
    ' must contain a single object');
  }

  let attrs;
  if (!is_component){
    attrs = strapi.contentTypes[uid].__schema__.attributes;
  }
  else {
    attrs = strapi.components[uid].__schema__.attributes;
  }
  if (!attrs){ throw new ValidationError('Invalid type ' + uid); }

  // Check if unrecognized fields are present
  const unrecognized = array.difference(Object.keys(entry), Object.keys(attrs));
  if (unrecognized.length) {
    console.log('Unrecognized fields', parents.concat([unrecognized]));
    throw new ValidationError('Unrecognized fields ' +
    unrecognized + ' in ' + parents.join('>'));
  }

  // Check all required fields are present
  // except for 'uid' because it is automatically generated
  const requiredFields = Object.keys(attrs)
    .filter((k) =>attrs[k].required === true && k !== 'uid');

  // Throw error if a required field is missing
  if (requiredFields.length !== array.intersection(
    requiredFields, Object.keys(entry)
  ).length){
    const missingFields = array.difference(requiredFields, Object.keys(entry));
    console.log('Missing required fields in ' + parents.join('>'),
      { parents: parents, missingFields: missingFields });
    throw new ValidationError(
      'Missing required fields in ' + parents.join('>') +
      ': ' + missingFields.join(', '),
      { parents: parents, missingFields: missingFields }
    );
  }

  // Loop through nonrelational fields and validate their types
  // using strapi.entityValidator
  const ctNonrelationFields = Object.keys(attrs)
    .filter((k) =>
      attrs[k].type !== 'relation' && attrs[k].type !== 'component'
    );
  await strapi.entityValidator.validateEntityCreation(
    !is_component ? strapi.contentTypes[uid] : strapi.components[uid],
    object.pick(entry, ctNonrelationFields), {})
    .catch ((error) => {
      const errors = error.details.errors
        .filter((e) =>
          e.path != ['uid'] &&
          e.message !== 'uid must be defined.' &&
          e.message !== 'Invalid relations'
        );
      if (errors.length){
        console.log('Invalid value(s) in ' + parents.join('>'),
          { errors: errors });
        throw new ValidationError(
          'Invalid value(s) in ' + parents.join('>') + ': ' +
          errors.map(e => e.path.join('.') + ' '),
          { errors: errors }
        );
      }
    });

  // Loop trough 'relation' fields and validate them as entries
  const ctRelationFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  for (const idx in relationData){
    const r = relationData[idx];
    if (attrs[r].relation === 'manyToMany' ||
    attrs[r].relation === 'oneToMany'){
      await validateData(attrs[r].target, entry[r], parents)
        .catch((e) => { throw e; });
    }
    else if (attrs[r].relation === 'oneToOne'){
      await validateEntry(attrs[r].target,entry[r], parents)
        .catch((e) => { throw e; });
    }
  }

  // Loop through 'component' fields
  const componentFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'component');
  const componentData = array.intersection(Object.keys(entry), componentFields);
  for (const cd in componentData){
    const component = componentData[cd];
    if (!attrs[component].repeatable){
      await validateEntry(
        attrs[component].component, entry[component],
        parents, is_component=true
      )
        .catch((e)=>{ throw e; });
    }
    else { // component field contains an array
      if (!Array.isArray(entry[component])){
        throw ValidationError(component + ' must contain an array');
      }
      for (const c in entry[component]){
        const comp = entry[component][c];
        await validateEntry(attrs[component].component, comp,
          parents, is_component=true)
          .catch((e)=>{ throw e; });
      }
    }
  }

};

const validateData = async (uid, entries, parents) => {
  
  if (!Array.isArray(entries)){
    throw ValidationError(uid + ' in ' +
    parents.join('>') + ' must contain an array');
  }
  for (const idx in entries){
    const entry = entries[idx];
    await validateEntry(uid, entry, parents)
      .catch((e) => { throw e; });
  }
   
};


module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    console.log('Validating JSON');
    for (const [key, entries] of Object.entries(data.data)) {
      const uid = Object.keys(strapi.contentTypes)
        .filter((k) => strapi.contentTypes[k].collectionName === key)[0];
      if (!uid){ throw new ValidationError('Invalid type ' + key); }
      await validateData(uid, entries, []).catch((e) => { throw e; });
    }

    console.log('Validated JSON');

    console.log('Stopping');
    throw new ApplicationError('stop', {});
  },

};