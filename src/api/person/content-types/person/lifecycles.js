module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const full_name = data.first_name + ' ' + data.last_name;
    event.params.data.full_name = full_name;

    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::person.person',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::person.person', where.id);
    const full_name = (data.first_name || entry.first_name) + ' ' + (data.last_name || entry.last_name);
    
    if (entry.full_name !== full_name){
      event.params.data.full_name = full_name;
      event.params.data.uid = await strapi.service('plugin::content-manager.uid')
        .generateUIDField({
          contentTypeUID: 'api::person.person',
          field: 'uid',
          data: event.params.data
        });
    }
  },
};