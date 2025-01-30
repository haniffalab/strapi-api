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

  const error = await strapi.config.functions.validateStudyAccess(entry.study, policyContext.request);
  if (error) {
    throw new UnauthorizedError(error);
  }

  return true;
};