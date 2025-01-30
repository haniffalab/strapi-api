const { UnauthorizedError, NotFoundError, ValidationError } = require('@strapi/utils').errors;

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

  const error = await strapi.config.functions.validateStudyAccess(entry, policyContext.request);
  if (error) {
    throw new UnauthorizedError(error);
  }

  return true;
};