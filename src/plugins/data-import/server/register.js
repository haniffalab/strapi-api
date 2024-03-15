'use strict';

module.exports = ({ strapi }) => {
  Object.values(strapi.contentTypes).forEach(contentType => {
    if (contentType.uid.includes('api::')) {
      contentType.attributes.datafile = {
        type: 'relation',
        relation: 'morphOne',
        target: 'plugin::data-import.datafile',
        morphBy: 'related',
        private: true,
        configurable: false,
      };
    }
  });
};
