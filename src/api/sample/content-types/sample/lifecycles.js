module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::sample.sample',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::sample.sample', where.id);
    
    if ('sample_id' in data && data.sample_id !== entry.sample_id){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid')
        .generateUIDField({
          contentTypeUID: 'api::sample.sample',
          field: 'uid',
          data: data
        });
    }
  },
};