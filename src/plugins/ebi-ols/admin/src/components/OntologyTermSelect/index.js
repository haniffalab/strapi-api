import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, TextInput, Tooltip, Tag } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { Stack } from '@strapi/design-system/Stack';
import { Field, FieldLabel, FieldError, FieldHint } from '@strapi/design-system/Field';
import { useIntl } from 'react-intl';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { stringify } from 'qs';
import _ from 'lodash';
import '../../styles.css';

const CACHE = {};
const SEARCH_URI = 'https://www.ebi.ac.uk/ols4/api/select';

async function makeAndHandleRequest(query, ontology) {
  const params = stringify({
    q: query,
    ontology,
    rows: 50,
  }, { addQueryPrefix: true });

  return await fetch(SEARCH_URI + params)
    .then((resp) => resp.json())
    .then(({ response }) => {
      const options = response.docs.map((i) => ({
        id: i.short_form,
        label: i.label,
        short_form: i.short_form,
        ontology_prefix: i.ontology_prefix,
        iri: i.iri,
      }));
      const total_count = response.numFound;
      return { options, total_count };
    })
    .catch((err) => {
      return { error: err.message }; 
    });
}

const OntologyTermSelect = ({
  value,
  onChange,
  name,
  intlLabel,
  attribute,
  placeholder,
  labelAction = null,
  required = false,
  description = null,
  disabled = false,
  error: propsError = null,
}) => {
  const { formatMessage } = useIntl();
  const [error, setError] = useState(propsError);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const handleInputChange = () => {
    setError(null);
  };

  // `handleInputChange` updates state and triggers a re-render, so
  // use `useCallback` to prevent the debounced search handler from
  // being cancelled.
  const handleSearch = useCallback(async (q) => {
    if (CACHE[q]) {
      setOptions(CACHE[q].options);
      return;
    }

    setError(null);
    setIsLoading(true);
    await makeAndHandleRequest(q, attribute.options.ontology).then((resp) => {
      const { error: respError, options: respOptions } = resp;
      if (respError){
        setError(respError);
        setIsLoading(false);
      }
      CACHE[q] = { ...resp };
      setIsLoading(false);
      setOptions(respOptions);
    });
  }, []);

  const parsedValue = typeof(value) === 'string' ? JSON.parse(value) : value;

  const handleRemove = (index) => {
    const newValue = parsedValue.filter((_, i) => i !== index);
    onChange({ target: { name, value: JSON.stringify(newValue), type: attribute.type }});
  };

  return (
    <Field
      name={name}
      id={name}
      error={error}
      hint={description && formatMessage(description)}
    >
      <Stack spacing={1}>
        <FieldLabel action={labelAction}>
          {formatMessage(intlLabel)}
        </FieldLabel>
        <AsyncTypeahead
          id="async-ebi-ols"
          isLoading={isLoading}
          labelKey="label"
          minLength={2}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
          options={options}
          placeholder="Search for an ontology term"
          inputProps={{
            required: { required },
            disabled: { disabled }
          }}
          onChange={(selected) => {
            const newValue = _.sortBy(_.unionBy(parsedValue, selected, 'id'), 'label');
            onChange({ target: { name, value: JSON.stringify(newValue), type: attribute.type } });
          }}
          renderInput={({ inputRef, referenceElementRef, ...inputProps }) => (
            <TextInput
              placeholder={placeholder && formatMessage(placeholder)}
              aria-label={formatMessage(intlLabel)}
              {...inputProps}
              ref={(input) => {
                // Be sure to correctly handle these refs. In many cases, both can simply receive
                // the underlying input node, but `referenceElementRef can receive a wrapper node if
                // your custom input is more complex (See TypeaheadInputMulti for an example).
                inputRef(input);
                referenceElementRef(input);
              }}
            />
          )}
          renderMenuItemChildren={(option) => (
            <Flex justifyContent="space-between">
              <div>{option.label}</div>
              <div><small>{option.short_form}</small></div>
            </Flex>
          )}
          useCache={false}
        />
        {parsedValue && 
        <Box paddingTop={2}>
          <Flex wrap="wrap" gap={1}>
            {parsedValue.map((item, index) => (
              <Tooltip label={item.id}>
                <Tag 
                  icon={<Cross aria-hidden />}
                  onClick={()=> handleRemove(index)}
                >
                  {item.label}
                </Tag>
              </Tooltip>
            ))}
          </Flex>
        </Box>
        }
        {description && <FieldHint>{description}</FieldHint>}
        {error && <FieldError>{error}</FieldError>}
      </Stack>
    </Field>
  );
};

OntologyTermSelect.propTypes = {
  intlLabel: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  attribute: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  labelAction: PropTypes.object,
  required: PropTypes.bool,
  value: PropTypes.array,
};

export default OntologyTermSelect;