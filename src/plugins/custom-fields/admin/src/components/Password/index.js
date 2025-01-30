import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldLabel, TextInput } from '@strapi/design-system';
import { useIntl } from 'react-intl';

const Password = ({ name, value, onChange, intlLabel }) => {
  
  const { formatMessage } = useIntl();

  return (
    <Field name={name}>
      <FieldLabel>
        {formatMessage(intlLabel)}
      </FieldLabel>
      <TextInput
        aria-label={formatMessage(intlLabel)}
        type="password"
        name={name}
        value={value || ''}
        onChange={onChange}
      />
    </Field>
    
  );
};

Password.propTypes = {
  intlLabel: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Password;