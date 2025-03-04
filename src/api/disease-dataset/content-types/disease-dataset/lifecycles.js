module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::disease-dataset.disease-dataset',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const isPublishAction = 'publishedAt' in data;

    if (!isPublishAction){
      const entry = await strapi.entityService.findOne('api::disease-dataset.disease-dataset', where.id);
    
      if ('name' in data && data.name !== entry.name){
        event.params.data.uid = await strapi.service('plugin::content-manager.uid')
          .generateUIDField({
            contentTypeUID: 'api::disease-dataset.disease-dataset',
            field: 'uid',
            data: data
          });
      }
    }
  },
};