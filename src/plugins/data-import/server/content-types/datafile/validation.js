'use strict';

const { ValidationError } = require('@strapi/utils').errors;
const { parseType } = require('@strapi/utils');
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
          e.message !== 'Invalid relations' &&
          e.message !== 'This attribute must be unique'
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
  // Manually validate 'date', 'datetime', 'time' fields
  // as entityValidator doesn't seem to validate them
  for (const fieldType of ['date', 'datetime', 'time']){
    const dateFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === fieldType);
    const data = object.pick(entry, dateFields);
    for (const f in data){
      try { parseType({type: fieldType, value: data[f]}); }
      catch(e){
        console.log('Invalid value(s) in ' +
          parents.join('>') + ': ' + f, { error: e.message });
        throw new ValidationError('Invalid value(s) in ' +
          parents.join('>') + ': ' + f, { error: e.message } 
        );
      }
    }
  }

  // Loop trough 'relation' fields and validate them as entries
  const ctRelationFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  for (const idx in relationData){
    const r = relationData[idx];
    if (attrs[r].relation === 'manyToMany' ||
    attrs[r].relation === 'oneToMany'){
      if (!Array.isArray(entry[r])) {
        throw ValidationError(attrs[r].target + ' must contain an array');
      }
      await validateEntries(attrs[r].target, entry[r], parents)
        .catch((e) => { throw e; });
    }
    else if (attrs[r].relation === 'oneToOne' ||
    attrs[r].relation === 'manyToOne'){
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

const validateEntries = async (uid, entries, parents) => {
  
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

exports.validateEntries = validateEntries;
exports.validateEntry = validateEntry;