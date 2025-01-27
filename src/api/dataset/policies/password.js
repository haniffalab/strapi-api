const bcrypt = require('bcryptjs');
const { ForbiddenError, NotFoundError } = require('@strapi/utils').errors;

module.exports = async (policyContext, _config, {strapi}) => {
  const { id } = policyContext.params;

  const entry = await strapi.db.query('api::dataset.dataset').findOne({
    where: { id },
    populate: { study: { password: true } }
  });

  if (!entry) {
    throw new NotFoundError('Dataset not found');
  }

  const {password: studyPassword} = entry.study;

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