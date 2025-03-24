'use strict';

const { ApplicationError } = require('@strapi/utils').errors;
const array = require('lodash/array');
const collection = require('lodash/collection');
const object = require('lodash/object');
const { isEqual } = require('lodash/lang');

const MAX_IDS = 500;

const getEbiFieldData = async (data, ontology) => {
  let id, iri, short_form, label;
  if (typeof data === 'string') { // consider as `label`
    label = data;
  }
  else if (typeof data === 'object' && !Array.isArray(data) && data !== null){
    ({ id, iri, short_form, label } = data);
  }
  const q = id || iri || short_form || label;
  const res = await strapi.config.functions.queryOLS(q, ontology).catch((e)=> {throw e;});
  let options;
  const { error } = res;
  ({options} = res);

  if (error) {
    throw new ApplicationError(error);
  }
  else if (!options || !options.length){
    throw new ApplicationError(`Provided data ${q} does not match to any ontology`);
  }

  if (label){
    options = options.filter((o) => 
      o.label.toLowerCase() === label.toLowerCase()
    );
  }
  if (options.length > 1){
    throw new ApplicationError(`Provided data ${q} does not match to a single ontology`);
  }

  return options[0];
};

const createOrUpdate = async (uid, entry, datafile_id, publish_on_import) => {

  const attrs = strapi.contentTypes[uid].__schema__.attributes;

  if (typeof entry === 'string'){
    const targetField = attrs['uid'].targetField;
    const entityData = {[targetField] : entry};
    const data = await strapi.service(uid).findByUid({params: entityData})
      .catch((e) => { throw e; });
    return data.id;
  }

  entry.datafile = datafile_id;

  // Search for entry in database
  const ctFields = Object.keys(attrs)
    .filter((k) => attrs[k].type !== 'component');
  const entityData = object.pick(entry, ctFields);

  const data = await strapi.service(uid).findByUid({params: entityData})
    .catch((e) => { throw e; });

  if (data) {
    // update

    // get previous relations to append to them, not overwrite them
    const ctRelationFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === 'relation' && 
      (attrs[k].relation === 'manyToMany' || attrs[k].relation === 'oneToMany'));
    const relationData = array.intersection(Object.keys(entry), ctRelationFields);
    for (const idx in relationData){
      const r = relationData[idx];
      entry[r] = array.union(
        r in data ? data[r].map((d) => d.id) : [],
        Array.isArray(entry[r]) ? entry[r] : [entry[r]]
      );
    }

    // get previous repeatable components to append to them, not overwrite them
    const ctComponentFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === 'component' && attrs[k].repeatable);
    const componentData = array.intersection(Object.keys(entry), ctComponentFields);
    for (const idx in componentData){
      const c = componentData[idx];
      entry[c] = array.unionWith(
        c in data ? data[c] : null,
        Array.isArray(entry[c]) ? entry[c] : [entry[c]],
        isEqual
      );
    }

    // get previous EBI ontology data to append to them, not overwrite them
    const ebiFields = Object.keys(attrs)
      .filter((k) => (
        attrs[k].type === 'customField' && attrs[k].customField === 'plugin::ebi-ols.ontology-term')
      );
    const ebiData = array.intersection(Object.keys(entry), ebiFields);
    for (const idx in ebiData){
      const e = ebiData[idx];
      entry[e] = collection.sortBy(array.unionBy(
        e in data ? data[e] : null,
        Array.isArray(entry[e]) ? entry[e] : [entry[e]],
        (item) => `${item.id}-${item.label}`
      ), 'label');
    }

    // published if unpublished
    if (publish_on_import && data.publishedAt == null) {
      entry.publishedAt = Date.now();
    }

    console.log('updating ' + uid + ' id: ' + data.id);
    const dbEntry = await strapi.entityService.update(uid, data.id, {
      data: entry
    }).catch((e) => { throw e; });
    console.log('updated ' + uid + ' id: ' + dbEntry.id);
    return dbEntry.id;

  }
  else {
    // create

    // publish entry
    if (publish_on_import) {
      entry.publishedAt = Date.now();
    } 

    // set a dummy 'uid'; if it is missing it will throw an error
    // it will be generated in the beforeCreate lifecycle anyways
    console.log('creating ' + uid);
    const dbEntry = await strapi.entityService.create(uid, {
      data: {...entry, uid: 'data-import' }, //dummy uid
    }).catch((e) => { throw e; });
    console.log('created ' + uid + ' id: ' + dbEntry.id);
    return dbEntry.id;
  }
};

const importRelations = async(attrs, r, data, datafile_id, publish_on_import) => {
  if (Array.isArray(data)) {
    const ids = await importEntries(attrs[r].target, data, datafile_id, publish_on_import)
      .catch((e) => { throw e; });
    return ids;
  }
  else {
    const id = await importEntry(attrs[r].target, data, datafile_id, publish_on_import)
      .catch((e) => { throw e; });
    return id;
  }
};

const importEntry = async (uid, entry, datafile_id, publish_on_import) => {
  let attrs;
  attrs = strapi.contentTypes[uid].__schema__.attributes;

  let excessData = [];

  // Loop through 'relation' fields
  const ctRelationFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  for (const idx in relationData){
    const r = relationData[idx];
    const rId = await importRelations(attrs, r, entry[r], datafile_id, publish_on_import)
      .catch((e) => { throw e; });
    entry[r] = rId;
    if (Array.isArray(entry[r]) && entry[r].length > MAX_IDS){
      excessData.push(r);
    }
  }

  // Loop through 'relation' fields in 'component' fields
  const componentFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'component');
  const componentData = array.intersection(Object.keys(entry), componentFields);
  for (const cd in componentData){
    const component = componentData[cd];
    const cAttrs = strapi.components[attrs[component].component].__schema__.attributes;
    const compRelationFields = Object.keys(cAttrs)
      .filter((k) => cAttrs[k].type == 'relation');
    if(!attrs[component].repeatable){
      const comp = entry[component];
      const relationData = array.intersection(Object.keys(comp), compRelationFields);
      for (const idx in relationData){
        const r = relationData[idx];
        const rId = await importRelations(cAttrs, r, comp[r], datafile_id, publish_on_import)
          .catch((e) => { throw e; });
        entry[component][r] = rId;
      }
    }
    else {
      for (const c in entry[component]){
        const comp = entry[component][c];
        const relationData = array.intersection(Object.keys(comp), compRelationFields);
        for (const idx in relationData){
          const r = relationData[idx];
          const rId = await importRelations(cAttrs, r, comp[r], datafile_id, publish_on_import)
            .catch((e) => { throw e; });
          entry[component][c][r] = rId;
        }
      }
    }
  }

  // Get EBI ontology data for custom EBI fields
  const ebiFields = Object.keys(attrs)
    .filter((k) => (
      attrs[k].type === 'customField' && attrs[k].customField === 'plugin::ebi-ols.ontology-term')
    );
  for (const idx in ebiFields){
    if (entry[ebiFields[idx]]){
      let data = [];
      for (const i in entry[ebiFields[idx]]){
        const res = await getEbiFieldData(entry[ebiFields[idx]][i], attrs[ebiFields[idx]].options.ontology)
          .catch((e) => { throw e; });
        data.push(res);
      }
      entry[ebiFields[idx]] = data;
    }
  }

  // Check if relations are too many for single import
  // if above 500 underlying SQL throws error about compound SELECT
  let id;
  if (!excessData.length){
    id = await createOrUpdate(uid, entry, datafile_id, publish_on_import)
      .catch((e) => { throw e; });
  }
  else {
    id = await inverseUpdate(uid, entry, datafile_id, publish_on_import, excessData)
      .catch((e) => { throw e; });
  }
  
  return id;
};

const inverseUpdate = async (uid, entry, datafile_id, publish_on_import, excessData) => {
  console.log('Attempting inverse updates');
  const attrs = strapi.contentTypes[uid].__schema__.attributes;

  let baseEntry = entry;
  let excessIds = {};
  for (const idx in excessData){
    const r = excessData[idx];
    excessIds[r] = entry[r];
    delete baseEntry[r];
  }

  // Initial create/update without relations that exceed MAX_IDS 
  const id = await createOrUpdate(uid, baseEntry, datafile_id, publish_on_import)
    .catch((e) => { throw e; });

  for (const r in excessIds) {
    const foreignUid = attrs[r].target;
    const foreignAttrs = strapi.contentTypes[foreignUid].__schema__.attributes;
    const foreignUidField = foreignAttrs['uid'].targetField;
    const foreignTarget = attrs[r]['mappedBy'] || attrs[r]['inversedBy'];
    for (const idx in excessIds[r]) {
      const foreignId = excessIds[r][idx];
      const foreignData = await strapi.entityService.findOne(foreignUid, foreignId, {
        fields: [foreignUidField],
      }).catch((e) => { throw e; });
      const foreignEntry = {
        [foreignUidField]: foreignData[foreignUidField],
        [foreignTarget]: id
      };
      const fId = await createOrUpdate(foreignUid, foreignEntry, datafile_id, publish_on_import)
        .catch((e) => { throw e; });
      if (fId !== foreignId) {
        console.log('Inverse update returned wrond id');
        throw new Error('Inverse update returned wrong id');
      }
    }
  }
    
  return id;
};

const importEntries = async (uid, entries, datafile_id, publish_on_import) => {
  const ids = [];
  for (const idx in entries){
    const entry = entries[idx];
    const id = await importEntry(uid, entry, datafile_id, publish_on_import)
      .catch((e) => { throw e; });
    ids.push(id);
  }
  return ids;
};

exports.importEntries = importEntries;
exports.importEntry = importEntry;