
'use strict';

const {
  winston,
  formats: { prettyPrint, levelFilter },
} = require('@strapi/logger');

module.exports = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        levelFilter('debug'),
        prettyPrint({ timestamps: 'YYYY-MM-DD hh:mm:ss.SSS' })
      ),
    }),
    new winston.transports.Console({
      level: 'http',
      format: winston.format.combine(
        levelFilter('http'),
        prettyPrint({ timestamps: 'YYYY-MM-DD hh:mm:ss.SSS' })
      ),
    }),
  ],
};