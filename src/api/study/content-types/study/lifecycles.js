const bcrypt = require('bcryptjs');

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::study.study',
        field: 'uid',
        data: data
      });

    event.params.data.password = data.password?.length ?
      bcrypt.hashSync(data.password, 10) :
      null;

    event.state = data.datasets;
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const isPublishAction = 'publishedAt' in data;

    if (!isPublishAction){
      const entry = await strapi.entityService.findOne('api::study.study', where.id);

      if ('study_id' in data && data.study_id !== entry.study_id){
        event.params.data.uid = await strapi.service('plugin::content-manager.uid')
          .generateUIDField({
            contentTypeUID: 'api::study.study',
            field: 'uid',
            data: data
          });
      }

      if (data.password !== entry.password){
        event.params.data.password = data.password?.length ?
          bcrypt.hashSync(data.password, 10) :
          null;
      }
    }

    event.state = data.datasets;
  },
  // Update datasets' dataset_id when connecting/disconnecting to/from study
  async afterCreate(event) {
    const datasets = event.state;
    for (const idx in datasets) {
      await strapi.entityService.update('api::dataset.dataset', datasets[idx], {
        data: { study: event.result.id }
      });
    }
  },
  async afterUpdate(event) {
    const { disconnect, connect } = event.state;
    for (const idx in disconnect) {
      await strapi.entityService.update('api::dataset.dataset', disconnect[idx].id, {
        data: { study: null }
      });
    }
    for (const idx in connect) {
      await strapi.entityService.update('api::dataset.dataset', connect[idx].id, {
        data: { study: event.result.id }
      });
    }
  }
};