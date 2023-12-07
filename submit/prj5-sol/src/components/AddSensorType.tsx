import React from 'react';
import { useState } from 'react';
import { Errors } from 'cs544-js-utils';
import { PagedValues, makeSensorsWs, SensorsWs } from '../lib/sensors-ws';
import SENSOR_DEFS, { FieldDef } from './sensor-fields';
import FormResult from './FormResult';

type AppProps = {
  ws: SensorsWs; // Assuming SensorsWs is the correct type
};

function AddSensorTypeForm(props: AppProps) {
  const { ws } = props;

  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(SENSOR_DEFS.SensorType.map((field) => [field.name, '']))
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    Object.fromEntries(SENSOR_DEFS.SensorType.map((field) => [field.name, '']))
  );

  const [formResult, setFormResult] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() === '' && SENSOR_DEFS.SensorType.find((field) => field.name === key)?.isFind) {
        errors[key] = `"${key}" is required`;
      }
    });

    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors, ...errors };
      return newErrors;
    });

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    const rootId = 'addSensorType';
    const form = document.getElementById(`${rootId}-form`) as HTMLFormElement;
    if (form) {
      ev.preventDefault();
      clearErrors('addSensorType');
      const formDataVal = getFormData(form);
      try {
        const result = await ws.addSensorType(formDataVal);
        if (result.isOk) {
          setFormResult(result.val);
        } else {
          if (result.errors[0]?.message === 'Failed to fetch') {
            displayErrors(rootId, result.errors);
          } else {
            displayErrors(rootId, result.errors);
            validateForm();
          }
        }
      } catch (error) {
        const errorResult = Errors.errResult('Failed to Fetch');
        displayErrors('addSensorType', errorResult.errors);
      }
    } else {
      console.error(`Form with ID ${rootId}-form not found.`);
    }
  };

  function clearErrors(rootId: string) {
    document.querySelectorAll(`.${rootId}-errors`).forEach((el) => {
      el.innerHTML = '';
    });

    // Clear form errors state using the callback function
    setFormErrors((prevErrors) => {
      const newErrors = Object.fromEntries(SENSOR_DEFS.SensorType.map((field) => [field.name, '']));
      return newErrors;
    });
  }

  function getFormData(form: HTMLFormElement): Record<string, string> {
    const pairs = [...new FormData(form).entries()]
      .map(([k, v]) => [k, v as string])
      .filter(([_, v]) => v.trim().length > 0);
    return Object.fromEntries(pairs);
  }

  function displayErrors(rootId: string, errors: Errors.Err[]) {
    for (const err of errors) {
      const id = err.options.widget;
      const widget = id && document.querySelector(`#${rootId}-${id}-error`);
      if (widget) {
        widget.append(err.message);
      } else {
        const li = makeElement('li', { class: 'error' }, err.message);
        document.querySelector(`#${rootId}-errors`)!.append(li);
      }
    }
  }

  function makeElement(tagName: string, attrs: { [attr: string]: string } = {}, text = '') {
    const element = document.createElement(tagName);
    for (const [k, v] of Object.entries(attrs)) {
      element.setAttribute(k, v);
    }
    if (text.length > 0) element.append(text);
    return element;
  }

  return (
    <div>
      <ul id="addSensorType-errors" className="addSensorType-errors"></ul>

      <form className="grid-form" id="addSensorType-form" name="addSensorType-form" onSubmit={handleFormSubmit}>
        {SENSOR_DEFS.SensorType.map((field) => (
          <React.Fragment key={field.name}>
            <label htmlFor={`addSensorType-${field.name}`}>
              {field.label} <span className="required" title="Required">*</span>
            </label>
            <span>
              <input
                id={`addSensorType-${field.name}`}
                name={field.name}
                type={field.type || 'text'}
                value={formData[field.name]}
                onChange={handleInputChange}
                />
              <br />
              <span id={`addSensorType-${field.name}-error`} className="addSensorType-errors error">
                {formErrors[field.name]}
              </span>
            </span>
          </React.Fragment>
        ))}
        <span></span>
        <button>Add Sensor Type</button>
      </form>
      <dl>
        <FormResult resultContainerId="addSensorType" result={formResult} />
      </dl>
    </div>
  );
}

export default AddSensorTypeForm;

