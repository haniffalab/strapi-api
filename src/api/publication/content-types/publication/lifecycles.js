module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
      contentTypeUID: 'api::publication.publication',
      field: 'uid',
      data: event.params.data
    });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::publication.publication', where.id);
    
    if ('title' in data && data.title !== entry.title){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
        contentTypeUID: 'api::publication.publication',
        field: 'uid',
        data: data
      });
    }
  },
  afterCreate(event){
    const { result } = event;
    const pub_id = result.id;

    // Add publication id to each author's publications
    result.authors.forEach(async author => {
      if (author.author != null){
        let res = await strapi.entityService.findOne('api::author.author', author.author.id, {
          fields: ['name'],
          populate: ['publications']
        });
        let pubs = new Set(res.publications.map(p => p.id));
        pubs.add(pub_id);
        res = await strapi.entityService.update('api::author.author', author.author.id, {
          data: {
            publications: Array.from(pubs)
          }
        });
      }
    });
  },

  afterUpdate(event){
    const { result } = event;
    const pub_id = result.id;

    // Add publication id to each author's publications
    result.authors.forEach(async author => {
      if (author.author != null){
        let res = await strapi.entityService.findOne('api::author.author', author.author.id, {
          fields: ['name'],
          populate: ['publications']
        });
        let pubs = new Set(res.publications.map(p => p.id));
        pubs.add(pub_id);
        res = await strapi.entityService.update('api::author.author', author.author.id, {
          data: {
            publications: Array.from(pubs)
          }
        });
      }
    });
  },

};