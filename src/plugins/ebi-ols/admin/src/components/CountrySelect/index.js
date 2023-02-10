import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Combobox, ComboboxOption } from '@strapi/design-system/Combobox';
import { TextInput } from '@strapi/design-system';
import { Stack } from '@strapi/design-system/Stack';
import { Field, FieldLabel, FieldError, FieldHint } from '@strapi/design-system/Field';
import { useIntl } from 'react-intl';
import getTrad from '../../utils/getTrad';
import {
    Card,
    CardHeader,
    CardBody,
    CardCheckbox,
    CardAsset,
    CardContent,
    CardTitle,
    CardSubtitle,
} from '@strapi/design-system/Card';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  cursor: pointer;
`;

import { AsyncTypeahead, Menu } from 'react-bootstrap-typeahead';

import 'react-bootstrap-typeahead/css/Typeahead.css';

const CACHE = {};
//const SEARCH_URI = 'https://api.github.com/search/users';
const SEARCH_URI = 'https://www.ebi.ac.uk/ols/api/select';

function makeAndHandleRequest(query) {
    return fetch(`${SEARCH_URI}?q=${query}&ontology=uberon`)
        .then((resp) => resp.json())
        .then(({ response }) => {
            const options = response.docs.map((i) => ({
                id: i.short_form,
                label: i.label,
                short_form: i.short_form,
                ontology_prefix: i.ontology_prefix,
            }));
            console.log(options)
            const total_count = response.numFound
            return { options, total_count };
        });
}



const CountrySelect = ({
    value,
    onChange,
    name,
    intlLabel,
    labelAction,
    required,
    attribute,
    description,
    placeholder,
    disabled,
    error,
}) => {
    const { formatMessage, messages } = useIntl();

    const parsedOptions = JSON.parse(messages[getTrad('countries')]);

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [query, setQuery] = useState('');

    const handleInputChange = (q) => {
        setQuery(q);
    };

    // `handleInputChange` updates state and triggers a re-render, so
    // use `useCallback` to prevent the debounced search handler from
    // being cancelled.
    const handleSearch = useCallback((q) => {
        if (CACHE[q]) {
            setOptions(CACHE[q].options);
            return;
        }

        setIsLoading(true);
        makeAndHandleRequest(q).then((resp) => {
            CACHE[q] = { ...resp };

            setIsLoading(false);
            setOptions(resp.options);
        });
    }, []);


    return (
        <Field
            name={name}
            id={name}
            error={error}
            hint={description && formatMessage(description)}
        >
            <Stack spacing={1}>
                <FieldLabel action={labelAction} required={required}>
                    {formatMessage(intlLabel)}
                </FieldLabel>
                <AsyncTypeahead
                    id="async-pagination-example"
                    isLoading={isLoading}
                    labelKey="label"
                    minLength={2}
                    onInputChange={handleInputChange}
                    onSearch={handleSearch}
                    options={options}
                    placeholder="Search for an ontology term"
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
                    // renderMenu={(results, menuProps) => (
                    //     <Menu {...menuProps}>
                    //         <StyledCard style={{ width: 200, marginTop: 70 }}>
                    //             <CardBody>
                    //                 {results.map((option) => (
                    //                     <div key={option.id} style={{ width: 200 }}>
                    //                         <span>{option.ontology_prefix}</span>
                    //                         <span>{option.label}</span>
                    //                     </div>
                    //                 ))}
                    //             </CardBody>
                    //         </StyledCard>
                    //     </Menu>
                    // )}
                    renderMenuItemChildren={(option) => (
                        <div key={option.id}>
                            <span>{option.ontology_prefix}</span>
                            <span>{option.label}</span>
                        </div>
                    )}
                    useCache={false}
                />
                <FieldHint />
                <FieldError />
            </Stack>
        </Field>
    )
}


CountrySelect.defaultProps = {
    description: null,
    disabled: false,
    error: null,
    labelAction: null,
    required: false,
    value: '',
};

CountrySelect.propTypes = {
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

export default CountrySelect;