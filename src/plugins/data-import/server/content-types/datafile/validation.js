'use strict';

const { ValidationError } = require('@strapi/utils').errors;
const { parseType } = require('@strapi/utils');
const array = require('lodash/array');
const object = require('lodash/object');

// Check EbiField is an array of strings or objects
const validateEbiField = (data) => {
  if (!Array.isArray(data)){
    return false;
  }
  for (const idx in data){
    let valid;
    if (typeof data[idx] === 'string') { // consider as `label`
      valid = true;
    }
    else if (typeof data[idx] === 'object' && !Array.isArray(data[idx]) && data[idx] !== null){
      const { id, iri, short_form, label } = data[idx];
      valid = id || iri || short_form || label;
    }
    else {
      valid = false;
    }
    if (!valid){
      return false;
    }
  }
  return true;
};

const validateEntry = async (uid, entry, parents, is_component=false) => {
  parents.push(uid);

  if (Array.isArray(entry)){
    console.log(parents.join('>') + ' must contain a single object');
    throw new ValidationError(parents.join('>') +
    ' must contain a single object');
  }

  let attrs;
  if (!is_component){
    attrs = strapi.contentTypes[uid].__schema__.attributes;
    if (!attrs['uid'].targetField) {
      console.log(uid + ' "uid" field has no "targetField".');
      throw new ValidationError(uid + ' "uid" field has no "targetField".');
    }
  }
  else {
    attrs = strapi.components[uid].__schema__.attributes;
  }
  if (!attrs){ throw new ValidationError('Invalid type ' + uid); }

  // Check if only 'uid' value was given and exists (oneToOne, oneToMany relations)
  if (typeof(entry) === 'string'){
    const targetField = attrs['uid'].targetField;
    if (attrs[targetField].type !== 'string'){
      console.log(uid + ' uid targetField type should be of type string.');
      throw new ValidationError(uid + 'uid targetField type should be of type string.' +
        'Update contentType.');
    }
    const entityData = {[targetField] : entry};
    const data = await strapi.service(uid).findByUid({params: entityData})
      .catch((e) => { throw e; });
    if (!data) {
      console.log(uid + 'with ' + targetField + ' = ' + entry + 'does not exist yet.');
      throw new ValidationError(uid + 'with ' + targetField + ' = ' + entry + 'does not exist yet.' +
        'Create it first before using only ' + targetField + ' to set the relation.');
    }
    return;
  }

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

  // Validate custom EBI ontology fields
  const ebiFields = Object.keys(attrs)
    .filter((k) => (
      attrs[k].type === 'customField' && attrs[k].customField === 'plugin::ebi-ols.ontology-term')
    );
  for (const idx in ebiFields){
    if (!attrs[ebiFields[idx]].options || !attrs[ebiFields[idx]].options.ontology){
      console.log(ebiFields[idx] + ' must have an ontology value in its attributes\' options');
      throw new ValidationError(ebiFields[idx] + ' must have an ontology value in its attributes\' options');
    }
    if (entry[ebiFields[idx]] && !validateEbiField(entry[ebiFields[idx]])){
      console.log(ebiFields[idx] + ' should be an array of strings representing the ontologies `label`' +
      ' or objects that must contain one of the following: `id`, `iri`, `short_form`, `label`');
      throw new ValidationError(ebiFields[idx] + ' should be an array of strings representing the ontologies `label`' +
      ' or objects that must contain one of the following: `id`, `iri`, `short_form`, `label`');
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
        throw new ValidationError(attrs[r].target + ' must contain an array');
      }
      await validateEntries(attrs[r].target, entry[r], parents)
        .catch((e) => { throw e; });
    }
    else if (attrs[r].relation === 'oneToOne' ||
    attrs[r].relation === 'manyToOne'){
      await validateEntry(attrs[r].target, entry[r], parents)
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
        throw new ValidationError(component + ' must contain an array');
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
    throw new ValidationError(uid + ' in ' +
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