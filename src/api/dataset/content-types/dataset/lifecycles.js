module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::dataset.dataset',
        field: 'uid',
        data: event.params.data.name
      });

    event.params.data.uid = uid;
    event.params.data.dataset_id = (data.study?.connect?.[0]?.id || null) + ':' + uid;
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const isPublishAction = 'publishedAt' in data;

    if (!isPublishAction){
      const entry = await strapi.entityService.findOne('api::dataset.dataset', where.id,
        {populate: {study: {fields: ['id']}}}
      );

      if ('name' in data && data.name !== entry.name){
        event.params.data.uid = await strapi.service('plugin::content-manager.uid')
          .generateUIDField({
            contentTypeUID: 'api::dataset.dataset',
            field: 'uid',
            data: data.name
          });
      }

      const {connect, disconnect} = data.study || {};
      let study_id = entry.study?.id || null;
      if (connect?.length) {
        study_id = connect[0].id;
      }
      if (disconnect?.length && disconnect[0].id === study_id) {
        study_id = null;
      }
      event.params.data.dataset_id = (study_id) + ':' + (event.params.data.uid || entry.uid);
    }
  },
};