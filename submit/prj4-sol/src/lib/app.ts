import { Errors } from 'cs544-js-utils';
import { PagedValues, makeSensorsWs, SensorsWs } from './sensors-ws.js';

import init from './init.js';
import { makeElement, getFormData } from './utils.js';

export default function makeApp(wsUrl: string) {
  const ws = makeSensorsWs(wsUrl);
  init();
  //TODO: add call to select initial tab and calls to set up
  //form submit listeners
  selectTab('addSensorType'); 
  setupAddFormListeners('addSensorType',ws); 
  setupAddFormListeners('addSensor',ws);
  setupFindFormListeners('findSensorTypes',ws); 
  setupFindFormListeners('findSensors',ws); 
}


//TODO: functions to select a tab and set up form submit listeners

// Function to select a  Default tab
function selectTab(rootId: string): void {
  const radioButtonTab = document.getElementById(`${rootId}-tab`) as HTMLInputElement;

  if(radioButtonTab){
    radioButtonTab.checked = true;
  }else{
    console.error(`Tab with ID ${rootId}-tab not found.`);
  }

}

// Function to set up form submit listeners
function setupAddFormListeners(rootId: string, ws:SensorsWs): void{
  const form = document.getElementById(`${rootId}-form`) as HTMLFormElement;

  if(!form){
    console.error(`Form with ID ${rootId}-form not found.`);
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    clearErrors(`${rootId}`);
    // Your logic for handling the form submission
    const formData = getFormData(form);
    try {
      //AddSensorType i.e Adding a Sensor Type
      if(rootId==='addSensorType'){
        const result = await ws.addSensorType(formData);
        if (result.isOk) {
          displaySuccessResult(`${rootId}-results`, result.val);
        } else {
          displayErrors(`${rootId}`, result.errors);
        }
      }
      //AddSensors i.e Adding a Sensor
      if(rootId==='addSensor'){
        const result = await ws.addSensor(formData);
        if (result.isOk) {
          displaySuccessResult(`${rootId}-results`, result.val);
        } else {
          displayErrors(`${rootId}`, result.errors);
        }
      }
    } catch (error) {
      const errorResult = Errors.errResult(error.message);
      displayErrors(`${rootId}`, errorResult.errors);
    }
  });

}


//Form Listeners for SensorType and Sensor
function setupFindFormListeners(rootId: string,ws: SensorsWs): void {
  const form = document.getElementById(`${rootId}-form`) as HTMLFormElement;

  if (!form) {
    console.error(`Form with ID ${rootId}-form not found.`);
    return;
  }
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(`${rootId}`);
    const formData = getFormData(form);
      
    try{
      //If Req is for finding SensorTypes
      if(rootId==='findSensorTypes'){ 
        const result = await ws.findSensorTypesByReq(formData);
    
        if (result.isOk) {
          processResult(form,rootId,ws,formData,result);  
        }else{
          displayErrors(`${rootId}`, result.errors);  
        }
      }
    
      //If Req is for Finding Sensors
      if(rootId==='findSensors'){
        const result = await ws.findSensorsByReq(formData);

        if (result.isOk) {
          processResult(form,rootId,ws,formData,result);
        }else{
          displayErrors(`${rootId}`, result.errors);
        }
      }
    }catch(error){
      const errorResult = Errors.errResult(error.message);
      // Display errors
      displayErrors(`${rootId}`, errorResult.errors);
    }
    
  });

}

// Generalized async function to help facilitate the FindSensorType and FindSensor
async function processResult(form: string | HTMLFormElement,rootId: string, ws: SensorsWs, formData: Record<string, string>,result: Errors.OkResult<PagedValues>) {
  const container = document.getElementById(`${rootId}-content`);
  const scrollDiv = container?.querySelectorAll('.scroll') as NodeListOf<HTMLElement>;

  scrollDiv.forEach((scrollDiv) => {
    const clonedScrollDiv = scrollDiv.cloneNode(true) as HTMLElement;
    const anchorTags = clonedScrollDiv.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

    const firstAnchor = anchorTags.item(0);
    const secondAnchor = anchorTags.item(1);

    // If Prev Page element exists
    if (result?.val.prev) {
      setVisibility(firstAnchor, true);

      firstAnchor.addEventListener('click', async function (ev) {
        const hrefValue = (result as MyResult)?.val?.prev?.href ?? '';

        // Get Prev Page SensorTypes or Sensors
        const nextResult =
          rootId === 'findSensorTypes'
            ? await ws.findSensorTypesByRelLink(hrefValue)
            : await ws.findSensorsByRelLink(hrefValue);

        if (nextResult.isOk) {
          processResult(form, rootId, ws, formData, nextResult);
        } else {
          console.error("No result present inside previous anchor tag");
        }
      });
    } else {
      setVisibility(firstAnchor, false);
    }

    // If Next Page element exists
    if (result?.val.next) {
      setVisibility(secondAnchor, true);

      secondAnchor.addEventListener('click', async function (ev) {
        const hrefValue = (result as MyResult)?.val?.next?.href ?? '';

        // Get Next page of SensorTypes or Sensors
        const nextResult =
          rootId === 'findSensorTypes'
            ? await ws.findSensorTypesByRelLink(hrefValue)
            : await ws.findSensorsByRelLink(hrefValue);

        if (nextResult.isOk) {
          processResult(form, rootId, ws, formData, nextResult);
        } else {
          console.error("No result present inside next anchor tag");
        }
      });
    } else {
      setVisibility(secondAnchor, false);
    }

    if (scrollDiv.parentNode) {
      // Replace the existing scroll controls with the cloned controls
      scrollDiv.parentNode.replaceChild(clonedScrollDiv, scrollDiv);
    } else {
      console.error("Parent node is null");
    }
  });

  displayResults(`${rootId}-results`, result.val.values);
}

// Interface for Results of Prev and Next Pages
interface MyResult {
  isOk: boolean;
  val: {
    values: Record<string, string>[];
    next?: LinkInfo;
    prev?: LinkInfo;
  };
}

// Interface for link information
interface LinkInfo {
  rel: string;
  href: string;
  method: string;
}



//Function used to display results on DOM
function displayResults(containerId: string, results: Record<string, string>[]) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container with ID ${containerId} not found.`);
    return;
  }

  // Clear previous results
  container.innerHTML = '';

  // Check if there are no results
  if (results.length === 0) {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'No results found.';
    container.appendChild(noResultsMessage);
    return;
  }

  // Create ul element
  const ul = document.createElement('ul');
  ul.classList.add('results');

  

  // Iterate through each result
  for (const result of results) {
    // Create dl element for each result
    const dl = document.createElement('dl');
    dl.classList.add('result');
    // Iterate through each key-value pair in the result
    for (const [key, value] of Object.entries(result)) {
      // Create dt and dd elements
      const dt = document.createElement('dt');
      dt.textContent = key;

      const dd = document.createElement('dd');
      dd.textContent = value;

      // Append dt and dd to dl
      dl.appendChild(dt);
      dl.appendChild(dd);
      
    }
    container.appendChild(dl);
   
  }
  
}


// Function to display success result in a dl
function displaySuccessResult(resultContainerId: string, result: Record<string, string>) {
  const resultContainer = document.getElementById(resultContainerId);

  if (resultContainer) {
    // Create a dl element
    const dl = document.createElement('dl');
    dl.classList.add('result');

    // Iterate through the result and create dt and dd elements
    for (const [key, value] of Object.entries(result)) {
      const dt = document.createElement('dt');
      dt.textContent = key;

      const dd = document.createElement('dd');
      dd.textContent = value;

      // Append dt and dd to the dl
      dl.appendChild(dt);
      dl.appendChild(dd);
    }

    // Append the dl to the result container
    resultContainer.appendChild(dl);
  } else {
    console.error(`Result container with ID ${resultContainerId} not found.`);
  }
}



/** clear out all errors within tab specified by rootId */
function clearErrors(rootId: string) {
  document.querySelectorAll(`.${rootId}-errors`).forEach( el => {
    el.innerHTML = '';
  });
}

/** Display errors for rootId.  If an error has a widget widgetId such
 *  that an element having ID `${rootId}-${widgetId}-error` exists,
 *  then the error message is added to that element; otherwise the
 *  error message is added to the element having to the element having
 *  ID `${rootId}-errors` wrapped within an `<li>`.
 */  
function displayErrors(rootId: string, errors: Errors.Err[]) {
  for (const err of errors) {
    const id = err.options.widget;
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

/** Turn visibility of element on/off based on isVisible.  This
 *  is done by adding class "show" or "hide".  It presupposes
 *  that "show" and "hide" are set up with appropriate CSS styles.
 */
function setVisibility(element: HTMLElement, isVisible: boolean) {
  element.classList.add(isVisible ? 'show' : 'hide');
  element.classList.remove(isVisible ? 'hide' : 'show');
}


