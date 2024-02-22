module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
      contentTypeUID: 'api::analysis.analysis',
      field: 'uid',
      data: event.params.data
    });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::analysis.analysis', where.id);
    
    if ('name' in data && data.name !== entry.name){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
        contentTypeUID: 'api::analysis.analysis',
        field: 'uid',
        data: data
      });
    }
  },
};