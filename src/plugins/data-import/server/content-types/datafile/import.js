'use strict';

const array = require('lodash/array');
const object = require('lodash/object');
const { isEqual } = require('lodash/lang');

const createOrUpdate = async (uid, entry, datafile_id, publish_on_import) => {

  entry.datafile = datafile_id;

  const attrs = strapi.contentTypes[uid].__schema__.attributes;

  // Search for entry in database
  const ctFields = Object.keys(attrs)
    .filter((k) => 
      attrs[k].type !== 'relation' && attrs[k].type !== 'component');
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
      entry[r] = array.union(r in data ? data[r].map((d) => d.id) : [], entry[r]);
    }

    // get previous repeatable components to append to them, not overwrite them
    const ctComponentFields = Object.keys(attrs)
      .filter((k) => attrs[k].type === 'component' && attrs[k].repeatable);
    const componentData = array.intersection(Object.keys(entry), ctComponentFields);
    for (const idx in componentData){
      const c = componentData[idx];
      entry[c] = array.unionWith(c in data ? data[c] : null, entry[c], isEqual);
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

  // Loop through 'relation' fields
  const ctRelationFields = Object.keys(attrs)
    .filter((k) => attrs[k].type === 'relation');
  const relationData = array.intersection(Object.keys(entry), ctRelationFields);
  for (const idx in relationData){
    const r = relationData[idx];
    const rId = await importRelations(attrs, r, entry[r], datafile_id, publish_on_import)
      .catch((e) => { throw e; });
    entry[r] = rId;
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

  const id = await createOrUpdate(uid, entry, datafile_id, publish_on_import)
    .catch((e) => { throw e; });

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