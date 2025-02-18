import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import getTrad from './utils/getTrad';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
    app.customFields.register({
      name: 'ontology-term',
      pluginId: pluginId,
      type: 'json',
      intlLabel: {
        id: getTrad('ebi-ols.ontology-term-select.label'),
        defaultMessage: 'Ontology Term',
      },
      intlDescription: {
        id: getTrad('ebi-ols.ontology-term-select.description'),
        defaultMessage: 'Select an ontology term',
      },
      components: {
        Input: async () =>
          import('./components/OntologyTermSelect'),
      },

      options: {
        base: [
          {
            sectionTitle: {
              id: getTrad('ebi-ols.ontology-term-select.section.select-terms'),
              defaultMessage: 'Select terms',
            },
            items: [
              {
                intlLabel: {
                  id: getTrad('ebi-ols.ontology-term-select.fields.ontology.label'),
                  defaultMessage: 'Ontology',
                },
                intlDescription: {
                  id: getTrad('ebi-ols.ontology-term-select.fields.ontology.description'),
                  defaultMessage: 'Ontology',
                },
                name: 'options.ontology',
                type: 'select',
                value: null, // option selected by default
                options: [
                  {
                    key: 'uberon',
                    value: 'uberon',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.uberon'),
                        defaultMessage: 'uberon',
                      },
                    },
                  },
                  {
                    key: 'ncbitaxon',
                    value: 'ncbitaxon',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.ncbitaxon'),
                        defaultMessage: 'ncbitaxon',
                      },
                    },
                  },
                  {
                    key: 'mondo',
                    value: 'mondo',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.mondo'),
                        defaultMessage: 'mondo',
                      },
                    },
                  },
                  {
                    key: 'pato',
                    value: 'pato',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.pato'),
                        defaultMessage: 'pato',
                      },
                    },
                  },
                  {
                    key: 'efo',
                    value: 'efo',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.efo'),
                        defaultMessage: 'efo',
                      },
                    },
                  },
                  {
                    key: 'cl',
                    value: 'cl',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('ebi-ols.ontology-term-select.fields.ontology.option.cl'),
                        defaultMessage: 'cl',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: {
              id: 'global.settings',
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: 'form.attribute.item.requiredField',
                  defaultMessage: 'Required field',
                },
                description: {
                  id: 'form.attribute.item.requiredField.description',
                  defaultMessage: 'You won\'t be able to create an entry if this field is empty',
                },
              },
            ],
          },
        ],
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) { },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
