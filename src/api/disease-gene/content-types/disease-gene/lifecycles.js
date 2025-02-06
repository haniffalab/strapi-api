module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const disease_gene = data.disease_id + '-' + data.gene_id;
    event.params.data.disease_gene = disease_gene;

    event.params.data.uid = await strapi.service('plugin::content-manager.uid')
      .generateUIDField({
        contentTypeUID: 'api::disease-gene.disease-gene',
        field: 'uid',
        data: event.params.data
      });
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const entry = await strapi.entityService.findOne('api::disease-gene.disease-gene', where.id);
    const disease_gene =
      (data.disease_id || entry.disease_id) + '-' +
      (data.gene_id || entry.gene_id);

    if (entry.disease_gene !== disease_gene){
      event.params.data.disease_gene = disease_gene;
      event.params.data.uid = await strapi.service('plugin::content-manager.uid')
        .generateUIDField({
          contentTypeUID: 'api::disease-gene.disease-gene',
          field: 'uid',
          data: event.params.data
        });
    }
  }
};