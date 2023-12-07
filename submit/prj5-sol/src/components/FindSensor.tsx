import React, { useEffect } from 'react';
import { useState } from 'react';
import { Errors } from 'cs544-js-utils';
import { PagedValues, makeSensorsWs, SensorsWs } from '../lib/sensors-ws';
import SENSOR_DEFS, { FieldDef } from './sensor-fields';
import FindWithScroll from './FindWithScroll';

type AppProps = {
  ws: SensorsWs;
};

function FindSensor(props: AppProps) {
  const { ws } = props;
  const [results, setResults] = useState<Record<string, string>[]>([]);
  const [resultLinks, setResultLinks] = useState<{ prev?: string; next?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handlePrevClick = async () => {
    if (resultLinks.prev) {
      const prevResult = await ws.findSensorsByRelLink(resultLinks.prev);

      if (prevResult.isOk) {
        setResults(prevResult.val.values);
        setResultLinks({ prev: prevResult.val.prev, next: prevResult.val.next });
      } else {
        console.error("Error fetching next results");
      }
    }
  };

  const handleNextClick = async () => {
    if (resultLinks.next) {
      const nextResult = await ws.findSensorsByRelLink(resultLinks.next);

      if (nextResult.isOk) {
        setResults(nextResult.val.values);
        setResultLinks({ prev: nextResult.val.prev, next: nextResult.val.next });
      } else {
        console.error("Error fetching next results");
      }
    }
  };

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function getFormData(form: HTMLFormElement): Record<string, string> {
    const pairs = [...new FormData(form).entries()].map(([k, v]) => [k, v as string]);
    return Object.fromEntries(pairs);
  }

  const handleFindSensor = async (ev: React.FormEvent<HTMLFormElement>) => {
    const rootId = 'findSensors';
    const form = document.getElementById(`${rootId}-form`) as HTMLFormElement;
    if (form) {
      ev.preventDefault();
      clearErrors('findSensors');
      const formDataVal = getFormData(form);
      try {
        const result = await ws.findSensorsByReq(formDataVal);
        if (result.isOk) {
          setResults(result.val.values);
          setResultLinks({
            prev: result.val.prev,
            next: result.val.next,
          });

          setSubmitted(true);
        } else {
          displayErrors(rootId, result.errors);
          setSubmitted(false);
        }
      } catch (error) {
        const errorResult = Errors.errResult(error.message);
        displayErrors(`${rootId}`, errorResult.errors);
      }
    } else {
      console.error(`Form with ID ${rootId}-form not found.`);
    }
  };

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

  function clearErrors(rootId: string) {
    document.querySelectorAll(`.${rootId}-errors`).forEach((el) => {
      el.innerHTML = '';
    });

    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors, id: '', sensorTypeId: '' };
      return newErrors;
    });
  }

  return (
    <div>
      <ul id="findSensors-errors" className="findSensors-errors"></ul>

      <form className="grid-form" id="findSensors-form" name="findSensors-form" onSubmit={handleFindSensor}>
        {SENSOR_DEFS.Sensor.filter(field => field.isFind).map(field => (
          <React.Fragment key={field.name}>
            <label htmlFor={`findSensors-${field.name}`}>{field.label}</label>
            <span>
              <input
                id={`findSensors-${field.name}`}
                name={field.name}
                type={field.type || 'text'}
              />
              <br />
              <span
                id={`findSensors-${field.name}-error`} className="findSensors-errors error"></span>
            </span>
          </React.Fragment> 
        ))}
        <span></span>
        <button>Find Sensors</button>
        <span></span>
      </form>
      {submitted && (
        <FindWithScroll results={results} prevLink={resultLinks.prev} nextLink={resultLinks.next} onPrevClick={handlePrevClick} 
        onNextClick={handleNextClick}/>)}
    </div>
  );
}

export default FindSensor;
