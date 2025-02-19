'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'customPassword',
    plugin: 'custom-fields',
    type: 'string',
    inputSize: {
      default: 4,
      isResizable: true
    }
  });
};
