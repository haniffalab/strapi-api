module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::experiment.experiment',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::experiment.experiment', where.id);
    
    if ('experiment_id' in data && data.experiment_id !== entry.experiment_id){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid')
        .generateUIDField({
          contentTypeUID: 'api::experiment.experiment',
          field: 'uid',
          data: data
        });
    }
  },
};