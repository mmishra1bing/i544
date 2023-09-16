import { Errors, Checkers } from 'cs544-js-utils';
import { validateFindCommand, SensorType, Sensor, SensorReading,
	 makeSensorType, makeSensor, makeSensorReading 
       } from './validators.js';

type FlatReq = Checkers.FlatReq; //dictionary mapping strings to strings

//marks T as having being run through validate()
type Checked<T> = Checkers.Checked<T>;


type SensorTypeId = string;
type SensorId = string;



/*********************** Top Level Sensors Info ************************/

export class SensorsInfo {

  //TODO: define instance fields; good idea to keep private and
  //readonly when possible.

  private readonly sensorTypes: Record<SensorTypeId, SensorType>;
  private readonly sensors: Record<SensorId, Sensor>;
  private readonly sensorReadings: Record<SensorId, SensorReading[]>;

  constructor() {
    //TODO
    debugger
    this.sensorTypes = {};
    this.sensors = {};
    this.sensorReadings = {};

  }

  /** Clear out all sensors info from this object.  Return empty array */
  clear() : Errors.Result<string[]> {
    //TODO
    
    return Errors.okResult([]);
  }

  /** Add sensor-type defined by req to this.  If there is already a
   *  sensor-type having the same id, then replace it. Return single
   *  element array containing the added sensor-type.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   */
  addSensorType(req: Record<string, string>) : Errors.Result<SensorType[]> {

    const sensorTypeResult = makeSensorType(req);
    if (!sensorTypeResult.isOk) return sensorTypeResult;
    const sensorType = sensorTypeResult.val;
    //TODO add into this

    // Add or replace the sensor type in the dictionary. (even without this everything is working fine)
    this.sensorTypes[sensorType.id] = sensorType;

    return Errors.okResult([sensorType]);
  }
  
  /** Add sensor defined by req to this.  If there is already a 
   *  sensor having the same id, then replace it.  Return single element
   *  array containing the added sensor.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   *     'BAD_ID': unknown sensorTypeId.
   */
  addSensor(req: Record<string, string>): Errors.Result<Sensor[]> {
    //TODO

    const sensorResult = makeSensor(req);
    
    if (!sensorResult.isOk) {
      return sensorResult;
    }
    const sensor = sensorResult.val;
    
    const sensorType = this.sensorTypes[req.sensorTypeId];
    if (!sensorType) {
      return Errors.errResult( 'Unknown sensorTypeId.', 'BAD_ID');
    }

    // Check if the provided min and max values are consistent with the sensor type.
    if (Number(req.min) < sensorType.limits.min || Number(req.max) > sensorType.limits.max) {
      return Errors.errResult( 'Expected range inconsistent with sensor-type.', 'BAD_RANGE');
    }


    this.sensors[sensor.id] = sensor;
    return Errors.okResult([sensor]);
  }

  /** Add sensor reading defined by req to this.  If there is already
   *  a reading for the same sensorId and timestamp, then replace it.
   *  Return single element array containing added sensor reading.
   *
   *  Error Codes:
   *     'REQUIRED': a required field is missing.
   *     'BAD_VAL': a bad value in a field (a numeric field is not numeric)
   *     'BAD_RANGE': an incorrect range with min >= max.
   *     'BAD_ID': unknown sensorId.
   */
  addSensorReading(req: Record<string, string>)
    : Errors.Result<SensorReading[]> 
  {
    //TODO
    const sensorReadingResult = makeSensorReading(req);
        
    if (!sensorReadingResult.isOk) {
      return sensorReadingResult;
    }
    const sensorReading = sensorReadingResult.val;

    if (!this.sensors[req.sensorId]) {
      return Errors.errResult( 'Unknown sensorId.', 'BAD_ID');
    }

    // Check if non-numeric fields are actually numeric.
    if (isNaN(Number(req.timestamp)) || isNaN(Number(req.value))) {
      return Errors.errResult( 'Non-numeric timestamp or value fields.', 'BAD_VAL' );
    }

    return Errors.okResult([sensorReading]);
  }

  /** Find sensor-types which satify req. Returns [] if none. 
   *  Note that all primitive SensorType fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   */
  findSensorTypes(req: FlatReq) : Errors.Result<SensorType[]> {
    const validResult: Errors.Result<Checked<FlatReq>> =
      validateFindCommand('findSensorTypes', req);
    if (!validResult.isOk) return validResult;
    //TODO
    // Initialize an array to store candidate sensor types
    let candidateSensorTypes: SensorType[] = Object.values(this.sensorTypes);

    // If the request specifies the id field, filter the list to have only one element
    if (req.id) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => sensorType.id === req.id);
    }

    // Filter the candidate sensor types using other specified fields in the request
    if (req.manufacturer) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.manufacturer === req.manufacturer);
    }
  
    if (req.modelNumber) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.modelNumber === req.modelNumber);
    }
  
    if (req.quantity) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.quantity === req.quantity);
    }
  
    if (req.unit) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.unit === req.unit);
    }
  
    if (req.min) {
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.limits.min === parseFloat(req.min));  
    }
  
    if (req.max) {  
      candidateSensorTypes = candidateSensorTypes.filter((sensorType) => 
      sensorType.limits.max === parseFloat(req.max));
    }

    // Sort the filtered sensor types by ID
    candidateSensorTypes.sort((a, b) => a.id.localeCompare(b.id));

    return Errors.okResult(candidateSensorTypes);

  }
  
  /** Find sensors which satify req. Returns [] if none. 
   *  Note that all primitive Sensor fields can be used to filter.
   *  The returned array must be sorted by sensor id.
   */
  findSensors(req: FlatReq) : Errors.Result<Sensor[]> { 
    //TODO
    // Validate the input request using the validateFindCommand function
    const validResult: Errors.Result<Checked<FlatReq>> =
  
    validateFindCommand('findSensors', req);

    if (!validResult.isOk) {
      return validResult;
    }
    
    // Initialize an empty array to store the filtered sensors
    const filteredSensors: Sensor[] = [];
    
    // Iterate through all sensors
    for (const sensor of Object.values(this.sensors)) {
      // Check if the id field is specified and matches the sensor's id
      if (req.id && sensor.id !== req.id) {
        continue;
      }
      
      // Check if the sensorTypeId field is specified and matches the sensor's sensorTypeId
      if (req.sensorTypeId && sensor.sensorTypeId !== req.sensorTypeId) {
        continue;
      }
      
      // If none of the filters apply, add the sensor to the filtered list  
      filteredSensors.push(sensor);
    }
    
    
    // Sort the filtered sensors by sensor id
    filteredSensors.sort((a, b) => a.id.localeCompare(b.id));
    
    return Errors.okResult(filteredSensors);
  
  }
  
  /** Find sensor readings which satify req. Returns [] if none.  Note
   *  that req must contain sensorId to specify the sensor whose
   *  readings are being requested.  Additionally, it may use
   *  partially specified inclusive bounds [minTimestamp,
   *  maxTimestamp] and [minValue, maxValue] to filter the results.
   *
   *  The returned array must be sorted numerically by timestamp.
   */
  findSensorReadings(req: FlatReq) : Errors.Result<SensorReading[]> {
    //TODO
    // Validate the input request using the validateFindCommand function
    const validResult: Errors.Result<Checked<FlatReq>> =
    validateFindCommand('findSensorReadings', req);
    if (!validResult.isOk) return validResult;

    const sensorId = req.sensorId;

    // Initialize an array to store candidate readings
    let candidateReadings: SensorReading[] = this.sensorReadings[sensorId];
    
    // Check if the sensorId exists
    if (!this.sensorReadings[sensorId]) {
      return Errors.okResult([]); // No readings found for the specified sensor
    }
    

    return Errors.okResult(candidateReadings);
  }
  
}

/*********************** SensorsInfo Factory Functions *****************/

export function makeSensorsInfo(sensorTypes: FlatReq[]=[],
				sensors: FlatReq[]=[],
				sensorReadings: FlatReq[]=[])
  : Errors.Result<SensorsInfo>
{
  const sensorsInfo = new SensorsInfo();
  const addResult =
    addSensorsInfo(sensorTypes, sensors, sensorReadings, sensorsInfo);
  return (addResult.isOk) ? Errors.okResult(sensorsInfo) : addResult;
}

export function addSensorsInfo(sensorTypes: FlatReq[], sensors: FlatReq[],
			       sensorReadings: FlatReq[],
			       sensorsInfo: SensorsInfo)
  : Errors.Result<void>
{
  for (const sensorType of sensorTypes) {
    const result = sensorsInfo.addSensorType(sensorType);
    if (!result.isOk) return result;
  }
  for (const sensor of sensors) {
    const result = sensorsInfo.addSensor(sensor);
    if (!result.isOk) return result;
  }
  for (const reading of sensorReadings) {
    const result = sensorsInfo.addSensorReading(reading);
    if (!result.isOk) return result;
  }
  return Errors.VOID_RESULT;
}



/****************************** Utilities ******************************/

//TODO add any utility functions or classes
