module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
      contentTypeUID: 'api::journal.journal',
      field: 'uid',
      data: event.params.data
    });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::journal.journal', where.id);
    
    if ('name' in data && data.name !== entry.name){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
        contentTypeUID: 'api::journal.journal',
        field: 'uid',
        data: data
      });
    }
  },
};