# Strapi plugin ebi-ols

Plugin to add custom field that has typeahead input that queries EBI's OLS.
Requires field in content-type schema to have the ontology used for searching, e.g.

```json
{
  "kind": "collectionType",
  "collectionName": "samples",
  "info": {
    "singularName": "sample",
    "pluralName": "samples",
    "displayName": "Sample",
    "description": ""
  },
  "attributes": {
    "tissue": {
      "type": "customField",
      "options": {
        "ontology": "uberon"
      },
      "customField": "plugin::ebi-ols.ontology-term"
    }
  }
}
```

Field itself will hold a JSON string with retrieved data from OLS: `id`, `label`, `short_form`, `ontology_name` and `iri`.

The typeahed component requires selection to be an array so existing data is parsed and turned into array when visualizing an entry in the admin page and selection taken out of array when saving to database.

# Data-import plugin

When importing data with the data-import plugin, the plugin will expect the value for this custom field to be either a string that would map to `label` or an object with at least one of the following keys: `id`, `iri`, `short_form`. The plugin will check if this data is provided when validating. When importing, the plugin will query OBLs and if there is a single entry that matches the data it will then assing it to the field. If there is none or more than one entry from OBLs then the import process will error out.