module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
      contentTypeUID: 'api::study.study',
      field: 'uid',
      data: event.params.data
    });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::study.study', where.id);
    
    if ('study_id' in data && data.study_id !== entry.study_id){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid').generateUIDField({
        contentTypeUID: 'api::study.study',
        field: 'uid',
        data: data
      });
    }
  },
};