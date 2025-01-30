const bcrypt = require('bcryptjs');
const { UnauthorizedError, NotFoundError } = require('@strapi/utils').errors;

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
    const [authType, authValue] = authHeader.split(' ');

    if (!authHeader || !['Basic', 'Bearer'].includes(authType)) {
      throw new UnauthorizedError('Invalid authorization');
    }

    if (authType === 'Basic') {
      const base64Credentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [_, password] = decodedCredentials.split(':');

      if (!password) {
        throw new UnauthorizedError('Password is required');
      }

      const validPassword = await bcrypt.compare(password, studyPassword);
      if (!validPassword) {
        throw new UnauthorizedError('Invalid password');
      }
    }
    else if (authType === 'Bearer') {
      const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(authValue);
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id },
        populate: { user_groups: {
          populate: { studies: { select: ['id', 'slug'] } }
        } } 
      });

      if (!user) {
        throw new UnauthorizedError('Invalid token');
      }
      
      const hasUserGroupAccess = user.user_groups.some(group =>
        group.studies.some(study => study.id === entry.study.id && study.slug === entry.study.slug)
      );

      if (!hasUserGroupAccess) {
        throw new UnauthorizedError('User does not have access to study');
      }
    }
  }

  return true;
};