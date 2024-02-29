module.exports = {
  async beforeCreate(event) {
    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::donor.donor',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::donor.donor', where.id);
    
    if ('donor_id' in data && data.donor_id !== entry.donor_id){
      event.params.data.uid = await strapi.service('plugin::content-manager.uid')
        .generateUIDField({
          contentTypeUID: 'api::donor.donor',
          field: 'uid',
          data: data
        });
    }
  },
};