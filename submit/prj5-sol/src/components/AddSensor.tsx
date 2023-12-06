import React, { useState } from 'react';
import { Errors } from 'cs544-js-utils';
import { PagedValues, makeSensorsWs, SensorsWs } from '../lib/sensors-ws';
import SENSOR_DEFS, { FieldDef } from './sensor-fields';

type AppProps = {
  ws: SensorsWs;
};

function SensorFormComponent(props: AppProps) {
  const { ws } = props;

  const [sensorData, setSensorData] = useState({
    id: '',
    sensorTypeId: '',
    period: '',
    min: '',
    max: '',
  });

  const [sensorErrors, setSensorErrors] = useState({
    id: '',
    sensorTypeId: '',
    period: '',
    min: '',
    max: '',
  });

  const [sensorResult, setSensorResult] = useState<Record<string, string>>({});

  const handleInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSensorErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    setSensorData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateSensorForm = () => {
    const errors: { [key: string]: string } = {};
    Object.entries(sensorData).forEach(([key, value]) => {
      if (value.trim() === '') {
        errors[key] = `"${key}" is required`;
      }
    });

    setSensorErrors((prevErrors) => ({ ...prevErrors, ...errors }));

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmission = async (ev: React.FormEvent<HTMLFormElement>) => {
    const rootId = 'sensorForm';
    const form = document.getElementById(`${rootId}-form`) as HTMLFormElement;

    if (form) {
      ev.preventDefault();
      clearFormErrors('sensorForm');
      const formDataVal = getFormDataValues(form);

      try {
        const result = await ws.addSensor(formDataVal);

        if (result.isOk) {
          setSensorResult(result.val);
        } else {
          displayFormErrors(rootId, result.errors);
        }

        if (validateSensorForm()) {
          const { id, sensorTypeId, period, min, max } = sensorData;
          console.log(id, sensorTypeId, period, min, max);
        } else {
          console.log('Sensor form has validation errors');
        }
      } catch (error) {
        const errorResult = Errors.errResult('Failed to Fetch');
        displayFormErrors('sensorForm', errorResult.errors);
      }
    } else {
      console.error(`Form with ID sensorForm-form not found.`);
    }
  };

  function clearFormErrors(rootId: string) {
    document.querySelectorAll(`.${rootId}-errors`).forEach((el) => {
      el.innerHTML = '';
    });

    setSensorErrors(() => ({ id: '', sensorTypeId: '', period: '', min: '', max: '' }));
  }

  function getFormDataValues(form: HTMLFormElement): Record<string, string> {
    const pairs = [...new FormData(form).entries()].map(([k, v]) => [k, v as string]).filter(([_, v]) => v.trim().length > 0);
    return Object.fromEntries(pairs);
  }

//   function displayFormErrors(rootId: string, errors: Errors.Err[]) {
//     for (const err of errors) {
//       const id = err.options.widget;
//       const widget = id && document.querySelector(`#${rootId}-${id}-error`);

//       if (widget) {
//         widget.append(err.message);
//       } else {
//         const li = createElement('li', { class: 'error' }, err.message);
//         document.querySelector(`#${rootId}-errors`)!.append(li);
//       }
//     }
//   }

function displayFormErrors(rootId: string, errors: Errors.Err[]) {
    for (const err of errors) {
      const id = err.options ? err.options.widget : null;
      const widget = id && document.querySelector(`#${rootId}-${id}-error`);
      if (widget) {
        widget.append(err.message);
      }
      else {
        const li = makeElement('li', {class: 'error'}, err.message);
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
      <ul id="sensorForm-errors" className="sensorForm-errors"></ul>

      <form className="grid-form" id="sensorForm-form" name="sensorForm-form" onSubmit={handleFormSubmission}>
        <label htmlFor="sensorForm-id">
          Sensor ID <span className="required" title="Required">*</span>
        </label>
        <span>
          <input id="sensorForm-id" name="id" value={sensorData.id} onChange={handleInputChangeEvent} />
          <br />
          <span id="sensorForm-id-error" className="sensorForm-errors error">
            {sensorErrors.id}
          </span>
        </span>

        <label htmlFor="sensorForm-sensorTypeId">
          Sensor Type ID <span className="required" title="Required">*</span>
        </label>
        <span>
          <input id="sensorForm-sensorTypeId" name="sensorTypeId" value={sensorData.sensorTypeId} onChange={handleInputChangeEvent} />
          <br />
          <span id="sensorForm-sensorTypeId-error" className="sensorForm-errors error">
            {sensorErrors.sensorTypeId}
          </span>
        </span>

        <label htmlFor="sensorForm-period">
          Period <span className="required" title="Required">*</span>
        </label>
        <span>
          <input id="sensorForm-period" name="period" type="number" value={sensorData.period} onChange={handleInputChangeEvent} />
          <br />
          <span id="sensorForm-period-error" className="sensorForm-errors error">
            {sensorErrors.period}
          </span>
        </span>

        <label htmlFor="sensorForm-min">
          Min Expected <span className="required" title="Required">*</span>
        </label>
        <span>
          <input id="sensorForm-min" name="min" type="number" value={sensorData.min} onChange={handleInputChangeEvent} />
          <br />
          <span id="sensorForm-min-error" className="sensorForm-errors error">
            {sensorErrors.min}
          </span>
        </span>

        <label htmlFor="sensorForm-max">
          Max Expected <span className="required" title="Required">*</span>
        </label>
        <span>
          <input id="sensorForm-max" name="max" type="number" value={sensorData.max} onChange={handleInputChangeEvent} />
          <br />
          <span id="sensorForm-max-error" className="sensorForm-errors error">
            {sensorErrors.max}
          </span>
        </span>
        <span></span>
        <button>Add Sensor</button>
      </form>
    </div>
  );
}

export default SensorFormComponent;
