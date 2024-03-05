# Strapi plugin data-import

Plugin to import data through a JSON string.

# How it works

The plugin can create or update entries in the database given the data in the JSON string.

The plugin contains a content-type called `datafile` with the following schema:

- `data`:
    the data to import in JSON format
- `description`:
    description of what the data being imported is
- `publish_on_import`:
    boolean to indicate whether imported data should be automatically set as published. Otherwise data will be created as draft (unless data already exists and gets updated, if its already published it will remain published).
- `related`:
    collection of id's of entries that get created/updated by this `datafile`.

Saving a `datafile` entry will trigger a `beforeCreate` lifecycle hook that will validate the JSON data. This validation will ensure required fields for all content-types are present as well as all fields contain the appropriate data type (text fields contain strings, date is correctly formatted, etc.) If validation fails the `datafile` entry will not be created an the error message will show up in the snackbar. Additional details of the error can be seen in the network request.

If validation completes successfully the `datafile` entry will be created and trigger an `afterCreate` lifecycle hook that will perform the data import. Data import is performed in this hook to be able to get the `datafile` entry `id` and include it in the imported data to be able to trace which `datafile` created/updated an entry. The import is performed in a recursive manner, as data can be nested, so the deepest nested entries are created before their 'parent' entry to correctly populate id's. Each entry will have the `datafile` `id` added.

For example, a `dataset` object that contains multiple `experiment`s nested inside with their own nested relations
```json
{
    "datasets": [
        { 
            "name":"my_dataset",
            "experiments": [
                { "experiment_id": "my_first_experiment" },
                { "experiment_id": "my_second_experiment" },
                {
                    "experiment_id": "my third_experiment",
                    "contributors": [
                        {
                            "person": {
                                "first_name": "firstname",
                                "last_name": "lastname"
                            }
                        }
                    ] 
                }
            ]
        },
    ]
}
```
In order to create/update the `dataset` entry, the data import will first create/update each `experiment` entry. Because *my_third_experiment*  contains a nested relation within its `contributors` component, the `person` entry will be created/updated before the `experiment` entry is imported.

**Note** updating can only replace or add data. For example, updating an existing entry that has a `manyToX` relation can only *add* new relations to it but cannot delete existing ones. Same goes for repeatable components, an update can only *add* new components but not delete existing ones. Deleting this type of data will require the use of the admin UI or access to the database.

## Requirements

For the plugin to work correctly it requires the rest of the content-types to contain specific fields and functions. As the validation and import steps of the plugin read the content-type schemas, as long as the content-types contain the necessary fields and services the plugin will continue to work regardless of changes to the schemas or new content-types.

### uid field

In order to make the JSON more user-friendly, the plugin doesn't expect the user to use an entry's `id` value to update it but rather a simpler text field its name or title. For example, identifying a `dataset` by its `name`; if the `name` matches an existing entry then that entry will be updated instead of explicitly setting the `id` in the JSON.

For this to work the plugin expects the content-type to contain a `uid` attribute that has as `target` the field that should be used as an identifier. For example, The `uid` of the `dataset` content-type has the `name` field as its `target`. The value of the `uid` field itself is irrelevant, it is only used as a flag to indicate the field used as identifier. The motivation for this approach is to have non-numerical identifiers that are not limited to slug-like text (can contain spaces, etc.) Of course this also means that if the text doesn't match **exactly** then another entry will be created instead of updated. To remove emphasis on the `uid` fields the content-types are expected to make them non-configurable from the admin UI and automatically generate them in lifecycle hooks using the `strapi.service('plugin::content-manager.uid').generateUIDField` function.

**Note** the `person` content-type needs additional setup as it contains `first_name` and `last_name` fields which by themselves are not useful as unique identifiers. For that reason the `person` model uses a `full_name` field which is non-configurable through the admin UI and generated from the `first_name` and `last_name` fields in its lifecycle hooks. This `full_name` field is then used as the `uid` field's target.

### findByUid service

In order to search for a match in a content-type's identifier (its `uid` field's `target`) the content-types require a service called `findByUid`. Again, the `person` content-type has special setup to search by either `first_name` and `last_name` or `full_name` depending on what's provided in the JSON data (though `full_name` can only be used in the JSON data if it is an existing entry to update, if it is a new entry it requires the other name fields.)

#### Component parameters functions

In order to correctly populate an entry's attributes to make an update the `findByUid` function needs to explicitly specify the `populate` parameter for a `findOne` query. By default, setting `populate: true` would be enough to populate all attributes including relations, but this does not populate component relation attributes. Thus, the service needs to get all components and their attributes and set them explicitly in the `populate` parameter. This is done through a custom `getPopulateParams` function. Subsequently a custom `reduceComponentData` function is used to return component relation attributes as the id(s) values only instead of the whole objects. This is performed to make it easy to compare contents for an entry update.

# JSON data format

The first level of the JSON data must contain as key(s) the *collection name* of the content-types, e.g. `datasets`, `studies`, as defined. This must contain an array of objects, each populated by the conten-type attributes. Each attribute must have an appropriate value given the content-type schema, otherwise the validation step will error out.

Relation attributes can contain either an array of objects or a single object, depending on the type of relation, e.g. `manyToOne`, `oneToOne`, etc. The correct type, array or object, is also checked by the validation step. Within the relation value the plugin expects the related content-type nested inside.
