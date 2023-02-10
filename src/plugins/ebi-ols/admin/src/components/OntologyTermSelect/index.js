import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Combobox, ComboboxOption } from '@strapi/design-system/Combobox';
import { TextInput } from '@strapi/design-system';
import { Stack } from '@strapi/design-system/Stack';
import { Field, FieldLabel, FieldError, FieldHint } from '@strapi/design-system/Field';
import { useIntl } from 'react-intl';
import getTrad from '../../utils/getTrad';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
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

const StyledMenu = styled(Menu)`
position: absolute;
top: 102%!important;
left: 0;
z-index: 1000;
width: 100%;
float: left;
min-width: 10rem;
padding: 0.5rem 0;
margin: 0.125rem 0 0;
font-size: 1rem;
color: #212529;
text-align: left;
list-style: none;
background-color: #fff;
background-clip: padding-box;
border: 1px solid rgba(0,0,0,.15);
border-radius: 0.25rem;
`;

const StyledMenuItem = styled(MenuItem)`
display: block;
width: 100 %;
padding: 0.25rem 1.5rem;
clear: both;
font - weight: 400;
color: #212529;
text - align: inherit;
white - space: nowrap;
background - color: transparent;
border: 0;
`;

const Wrapper = styled.div`
.rbt .rbt-input-main::-ms-clear {
    display: none;
  }
  
  /**
   * Menu
   */
  .rbt-menu {
    margin-bottom: 2px;
  }
  .rbt-menu > .dropdown-item {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rbt-menu > .dropdown-item:focus {
    outline: none;
  }
  .rbt-menu-pagination-option {
    text-align: center;
  }
  
  /**
   * Multi-select Input
   */
  .rbt-input-multi {
    cursor: text;
    overflow: hidden;
    position: relative;
  }
  .rbt-input-multi.focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    color: #495057;
    outline: 0;
  }
  .rbt-input-multi.form-control {
    height: auto;
  }
  .rbt-input-multi.disabled {
    background-color: #e9ecef;
    opacity: 1;
  }
  .rbt-input-multi.is-invalid.focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
  .rbt-input-multi.is-valid.focus {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  }
  .rbt-input-multi input::-moz-placeholder {
    color: #6c757d;
    opacity: 1;
  }
  .rbt-input-multi input:-ms-input-placeholder {
    color: #6c757d;
  }
  .rbt-input-multi input::-webkit-input-placeholder {
    color: #6c757d;
  }
  .rbt-input-multi .rbt-input-wrapper {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: -4px;
    margin-top: -1px;
    overflow: hidden;
  }
  .rbt-input-multi .rbt-input-main {
    margin: 1px 0 4px;
  }
  
  /**
   * Close Button
   */
  .rbt-close {
    z-index: 1;
  }
  .rbt-close-lg {
    font-size: 1.5rem;
  }
  
  /**
   * Token
   */
  .rbt-token {
    background-color: #e7f4ff;
    border: 0;
    border-radius: 0.25rem;
    color: #007bff;
    display: inline-flex;
    line-height: 1rem;
    margin: 1px 3px 2px 0;
  }
  .rbt-token .rbt-token-label {
    padding: 0.25rem 0.5rem;
  }
  .rbt-token .rbt-token-label:not(:last-child) {
    padding-right: 0.25rem;
  }
  .rbt-token-disabled {
    background-color: rgba(0, 0, 0, 0.1);
    color: #495057;
    pointer-events: none;
  }
  .rbt-token-removeable {
    cursor: pointer;
  }
  .rbt-token-active {
    background-color: #007bff;
    color: #fff;
    outline: none;
    text-decoration: none;
  }
  .rbt-token .rbt-token-remove-button {
    background-image: none;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
    box-shadow: none;
    color: inherit;
    display: flex;
    justify-content: center;
    font-size: inherit;
    font-weight: normal;
    opacity: 1;
    outline: none;
    padding: 0.25rem 0.5rem;
    padding-left: 0;
    text-shadow: none;
  }
  .rbt-token .rbt-token-remove-button .rbt-close-content {
    display: block;
  }
  
  /**
   * Loader + CloseButton container
   */
  .rbt-aux {
    align-items: center;
    display: flex;
    bottom: 0;
    color: red;
    justify-content: center;
    pointer-events: none;
    /* Don't block clicks on the input */
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;
  }
  .rbt-aux-lg {
    width: 3rem;
  }
  .rbt-aux .rbt-close {
    margin-top: -0.25rem;
    pointer-events: auto;
    /* Override pointer-events: none; above */
  }
  
  .has-aux .form-control {
    padding-right: 2rem;
  }
  .has-aux .form-control.is-valid, .has-aux .form-control.is-invalid {
    background-position: right 2rem center;
    padding-right: 4rem;
  }
  
  .rbt-highlight-text {
    background-color: inherit;
    color: inherit;
    font-weight: bold;
    padding: 0;
  }
  
  /**
   * Input Groups
   */
  .input-group > .rbt {
    flex: 1;
  }
  .input-group > .rbt .rbt-input-hint, .input-group > .rbt .rbt-aux {
    z-index: 5;
  }
  .input-group > .rbt:not(:first-child) .form-control {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .input-group > .rbt:not(:last-child) .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const CACHE = {};
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



const OntologyTermSelect = ({
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
                <Wrapper>
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
                        renderMenu={(results, menuProps) => (
                            <StyledMenu {...menuProps}>
                                {results.map((result, index) => (
                                    <StyledMenuItem option={result.id} position={index}>
                                        <span>{result.ontology_prefix}</span>
                                        <span>{result.label}</span>
                                    </StyledMenuItem>
                                ))}
                            </StyledMenu>
                        )}
                        // renderMenuItemChildren={(option) => (
                        //     <div key={option.id}>
                        //         <span>{option.ontology_prefix}</span>
                        //         <span>{option.label}</span>
                        //     </div>
                        // )}
                        useCache={false}
                    />
                </Wrapper>
                <FieldHint />
                <FieldError />
            </Stack>
        </Field>
    )
}


OntologyTermSelect.defaultProps = {
    description: null,
    disabled: false,
    error: null,
    labelAction: null,
    required: false,
    value: '',
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