import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, TextInput, Tooltip, Tag } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { Stack } from '@strapi/design-system/Stack';
import { Field, FieldLabel, FieldError, FieldHint } from '@strapi/design-system/Field';
import { useIntl } from 'react-intl';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { stringify } from 'qs';
import _ from 'lodash';
import '../../styles.css';

const CACHE = {};
const SEARCH_URI = 'https://www.ebi.ac.uk/ols4/api/select';

const FALLBACK_OPTION = {
  id: -1,
  short_form: null,
  ontology_prefix: null,
  iri: null,
};

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
    setIsLoading(true);
    if (CACHE[q]) {
      setOptions(CACHE[q].options);
      setIsLoading(false);
      setError(null);
      return;
    }
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

  // @TODO: fix ref issues 
  const renderInput = ({...inputProps}) => (
    <TextInput
      id={name}
      key={name}
      placeholder={placeholder && formatMessage(placeholder)}
      aria-label={formatMessage(intlLabel)}
      {...inputProps}
    />
  );

  const renderMenuItemChildren = (option) => (
    <Flex key={`${option.id}-${option.label}`} justifyContent="space-between">
      <div>{option.label}</div>
      <div><small>{option.short_form}</small></div>
    </Flex>
  );

  const renderMenu = useCallback((results, {renderMenuItemChildren, ...menuProps}, state) => {
    const fallbackOption = !isLoading && !results.length ?
      {label: state.text, ...FALLBACK_OPTION} : null;
    return (
      <Menu id={name} key={name} {...menuProps}>
        {isLoading ? <MenuItem disabled>Searching...</MenuItem> :
          results.map((option) => (
            <MenuItem key={option.id} option={option}>
              {renderMenuItemChildren(option)}
            </MenuItem>
          ))}
        {fallbackOption &&
        <>
          <MenuItem disabled>No matches found.</MenuItem>
          <Menu.Divider />
          <MenuItem key={-1} option={fallbackOption} className="fallback">
            <Flex key={fallbackOption.id} justifyContent="space-between">
              <div>{fallbackOption.label}</div>
              <div><small>Add without matching ontology</small></div>
            </Flex>
          </MenuItem>
        </>
        }
      </Menu>
    );
  }, [isLoading]);

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
          id={name + '-typeahead'}
          key={name + '-typeahead'}
          isLoading={isLoading}
          labelKey="label"
          minLength={2}
          onInputChange={handleInputChange}
          onSearch={handleSearch}
          options={options}
          placeholder="Search for an ontology term"
          onChange={(selected) => {
            const newValue = _.sortBy(
              _.unionBy(parsedValue, selected, (item) => `${item.id}-${item.label}`),
              'label'
            );
            onChange({ target: { name, value: JSON.stringify(newValue), type: attribute.type } });
          }}
          inputProps={{
            required: required,
            disabled: disabled
          }}
          renderInput={renderInput}
          renderMenuItemChildren={renderMenuItemChildren}
          renderMenu={renderMenu}
          useCache={false}
        />
        {parsedValue && 
        <Box paddingTop={2}>
          <Flex wrap="wrap" gap={1}>
            {parsedValue.map((item, index) => (
              <Tooltip key={`${item.id}-${item.label}`} label={item.id}>
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
  value: PropTypes.string,
};

export default OntologyTermSelect;