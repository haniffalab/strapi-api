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

  // If created through admin event.state will be an object with connect, disconnect
  // If created through import plugin datasets will be an array of ids
  async afterCreate(event) {
    let datasets = event.state;
    if (!Array.isArray(datasets)){
      datasets = datasets.connect?.map((d) => d.id) || [];
    }
    for (const idx in datasets) {
      await strapi.entityService.update('api::dataset.dataset', datasets[idx], {
        data: {} // study id will already be added to the dataset
      });
    }
  },
  async afterUpdate(event) {
    let datasets = event.state;
    if (!Array.isArray(datasets)){
      const {connect = [], disconnect = []} = datasets;
      datasets = [...connect.map((d) => d.id), ...disconnect.map((d) => d.id)];
    }
    for (const idx in datasets) {
      await strapi.entityService.update('api::dataset.dataset', datasets[idx], {
        data: {} // study id will already be added to the dataset
      });
    }
  }
};