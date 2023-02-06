import ShopifyIcon from '../components/ShopifyIcon';
import pluginId from '../pluginId';
import getTrad from '../utils/getTrad';
import * as yup from 'yup';
import options from '../fields/options';

export default {
  name: 'ncbitaxon',
  pluginId,
  type: 'json',
  icon: ShopifyIcon,
  multiple: true,
  components: {
    Input: async () => import('../components/Input/Single'),
  },
  intlLabel: {
    id: getTrad('custom-fields.ncbitaxon.label'),
    defaultMessage: 'EBI OLS - NCBI Taxonomy',
  },
  intlDescription: {
    id: getTrad('custom-fields.ncbitaxon.description'),
    defaultMessage: 'Select a product from Shopify',
  },
  options: {
    base: [options.fields],
    advanced: [
      options.collectionId,
      options.createdAtMax,
      options.createdAtMin,
      options.publishedAtMax,
      options.publishedAtMin,
      options.publishedStatus,
      options.updatedAtMax,
      options.updatedAtMin,
      options.vendor,
      options.status,
      options.productType,
      options.sinceId,
      options.presentmentCurrencies,
    ],
    validator: () => ({
      fields: yup.array().of(yup.string()).default([]),
    }),
  },
};
