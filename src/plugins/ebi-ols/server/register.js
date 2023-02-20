'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'ontology-term',
    plugin: 'ebi-ols',
    type: 'json',
  });
};
