const bcrypt = require('bcryptjs');
const study = require('../routes/study');
const { ForbiddenError, NotFoundError, ValidationError } = require('@strapi/utils').errors;

module.exports = async (policyContext, _config, {strapi}) => {
  const { id, slug } = policyContext.params;

  let entry;
  if (id) {
    entry = await strapi.db.query('api::study.study').findOne({
      where: { id }
    });
  }
  else if (slug) {
    entry = await strapi.db.query('api::study.study').findOne({
      where: { study_id: slug }
    });
  }
  else {
    throw new ValidationError('Study ID or slug is required');
  }

  if (!entry) {
    throw new NotFoundError('Study not found');
  }

  const {password: studyPassword} = entry;

  if (studyPassword) {
    const authHeader = policyContext.request.header['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new ForbiddenError('Invalid authorization');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

    const [_, password] = decodedCredentials.split(':');

    if (!password) {
      throw new ForbiddenError('Password is required');
    }

    const validPassword = await bcrypt.compare(password, studyPassword);
    if (!validPassword) {
      throw new ForbiddenError('Invalid password');
    }
  }

  return true;
};