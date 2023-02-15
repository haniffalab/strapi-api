import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginId from './pluginId';
import OntologyTermSelectIcon from './components/OntologyTermSelectIcon';
import getTrad from './utils/getTrad';
import countries from 'i18n-iso-countries';

export default {
  register(app) {
    app.customFields.register({
      name: 'ontology',
      pluginId: pluginId,
      type: 'string',
      icon: OntologyTermSelectIcon,
      intlLabel: {
        id: getTrad('ebi-ols.ontology-term-select.label'),
        defaultMessage: 'Ontology',
      },
      intlDescription: {
        id: getTrad('ebi-ols.ontology-term-select.description'),
        defaultMessage: 'Select an ontology',
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
                /*
                  Add a "Color format" dropdown
                  to choose between 2 different format options
                  for the color value: hexadecimal or RGBA
                */
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
                value: '', // option selected by default
                options: [ // List all available "Color format" options
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
                  defaultMessage: "You won't be able to create an entry if this field is empty",
                },
              },
            ],
          },
        ],
      },
    });
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return Promise.all([
          import(`./translations/${locale}.json`)
        ])
          .then(([pluginTranslations, ontologyTermTranslations]) => {
            return {
              data: {
                ...prefixPluginTranslations(pluginTranslations.default, pluginId)
              },
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
