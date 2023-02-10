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
        id: getTrad('ontology-term-select.label'),
        defaultMessage: 'Ontology',
      },
      intlDescription: {
        id: getTrad('ontology-term-select.description'),
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
              id: 'color-picker.color.section.format',
              defaultMessage: 'Format',
            },
            items: [
              {
                /*
                  Add a "Color format" dropdown
                  to choose between 2 different format options
                  for the color value: hexadecimal or RGBA
                */
                intlLabel: {
                  id: 'color-picker.color.format.label',
                  defaultMessage: 'Color format',
                },
                name: 'options.format',
                type: 'select',
                value: 'hex', // option selected by default
                options: [ // List all available "Color format" options
                  {
                    key: 'hex',
                    value: 'hex',
                    metadatas: {
                      intlLabel: {
                        id: 'color-picker.color.format.hex',
                        defaultMessage: 'Hexadecimal',
                      },
                    },
                  },
                  {
                    key: 'rgba',
                    value: 'rgba',
                    metadatas: {
                      intlLabel: {
                        id: 'color-picker.color.format.rgba',
                        defaultMessage: 'RGBA',
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
