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
    event.params.data.dataset_id = data.study?.connect?.[0] || null + ':' + uid;
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

      event.params.data.dataset_id = (data.study?.connect?.[0] || entry.study?.id || null) + ':' + (event.params.data.uid || entry.uid);
    }
  },
};