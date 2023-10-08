import { SensorType, Sensor, SensorReading,
	 SensorTypeSearch, SensorSearch, SensorReadingSearch,
       } from './validators.js';

import { Errors, } from 'cs544-js-utils';

import * as mongo from 'mongodb';

/** All that this DAO should do is maintain a persistent data for sensors.
 *
 *  Most routines return an errResult with code set to 'DB' if
 *  a database error occurs.
 */

/** return a DAO for sensors at URL mongodbUrl */
export async function
makeSensorsDao(mongodbUrl: string) : Promise<Errors.Result<SensorsDao>> {
  return SensorsDao.make(mongodbUrl);
}

//the types stored within collections
type DbSensorType = SensorType & { _id: string };
type DbSensor = Sensor & { _id: string };

//options for new MongoClient()
const MONGO_OPTIONS = {
  ignoreUndefined: true,  //ignore undefined fields in queries
};

export class SensorsDao {
  private readonly client: mongo.MongoClient;
  private readonly sensorTypeCollection: mongo.Collection<SensorType>;
  private readonly sensorCollection: mongo.Collection<Sensor>;
  private readonly sensorReadingCollection: mongo.Collection<SensorReading>;
  
  private constructor(client: mongo.MongoClient, sensorTypeCollection: mongo.Collection<SensorType>,
    sensorCollection: mongo.Collection<Sensor>, 
    sensorReadingCollection: mongo.Collection<SensorReading>) {
    //TODO
    this.client = client;
    this.sensorTypeCollection = sensorTypeCollection;
    this.sensorCollection = sensorCollection;
    this.sensorReadingCollection = sensorReadingCollection;
  }

  /** factory method
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  static async make(dbUrl: string) : Promise<Errors.Result<SensorsDao>> {
    //takes care of all async ops, then call constructor
    try {
      const client = await (new mongo.MongoClient(dbUrl)).connect();
      const db = client.db();
      
      // Get references to the collections
      const sensorTypeCollection = db.collection<SensorType>('sensorTypes');
      const sensorCollection = db.collection<Sensor>('sensors');
      const sensorReadingCollection = db.collection<SensorReading>('sensorReadings');

      // If the connection and collection retrieval is successful, create a SensorsDao instance
      return Errors.okResult(new SensorsDao(client, sensorTypeCollection, sensorCollection, sensorReadingCollection ));
    } catch (e) {
      // Handle database connection error
      return Errors.errResult(e.message, 'DB');
    }
    // return Errors.errResult('todo', 'TODO');
  }

  /** Release all resources held by this dao.
   *  Specifically, close any database connections.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async close() : Promise<Errors.Result<void>> {
    try {
      // Close the MongoDB client connection
      await this.client.close();
      return Errors.VOID_RESULT;
    } catch (e) {
      // Handle any errors that occur during the closing process
      return Errors.errResult(e.message, 'DB');
    }
    // return Errors.errResult('todo', 'TODO');
  }

  /** Clear out all sensor info in this database
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async clear() : Promise<Errors.Result<void>> {
    try {
      // Delete all documents from the 'sensorTypes' and 'sensors' collections
      await this.sensorTypeCollection.deleteMany({})
      await this.sensorCollection.deleteMany({});
      return Errors.VOID_RESULT;
    } catch (e) {
      // Handle any errors that occur during the database clearing process
      return Errors.errResult(e.message, 'DB');
    }

    // return Errors.errResult('todo', 'TODO');
  }


  /** Add sensorType to this database.
   *  Error Codes: 
   *    EXISTS: sensorType with specific id already exists in DB.
   *    DB: a database error was encountered.
   */
  async addSensorType(sensorType: SensorType)
    : Promise<Errors.Result<SensorType>>
  {
    
    try {
      // Check if a sensor type with the same ID already exists
      const existingSensorType = await this.sensorTypeCollection.findOne({ id: sensorType.id });
      if (existingSensorType) {
        return Errors.errResult(
          `Sensor type with ID '${sensorType.id}' already exists.`,
          { code: 'EXISTS', sensorTypeId: sensorType.id }
        );
      }
  
      // Insert the new sensor type into the collection
      const result = await this.sensorTypeCollection.insertOne(sensorType);
  
      // Check if the insertion was successful
      if (result.insertedId) {
        // Return the added sensor type without the _id field
        const addedSensorType: SensorType = {...sensorType,};
       
        return Errors.okResult(addedSensorType);
      } else {
        return Errors.errResult('Failed to add sensor type to the database.', 'DB');
      }
    } catch (e) {
      return Errors.errResult(e.message, 'DB');
    }

    // return Errors.errResult('todo', 'TODO');
  }

  /** Add sensor to this database.
   *  Error Codes: 
   *    EXISTS: sensor with specific id already exists in DB.
   *    DB: a database error was encountered.
   */
  async addSensor(sensor: Sensor) : Promise<Errors.Result<Sensor>> {
    try {
      // Check if a sensor with the same ID already exists
      const existingSensor = await this.sensorCollection.findOne({ id: sensor.id });
      if (existingSensor) {
        return Errors.errResult(
          `Sensor with ID '${sensor.id}' already exists.`,
          { code: 'EXISTS', sensorId: sensor.id }
        );
      }
      const result = await this.sensorCollection.insertOne(sensor);
      
      if (result.insertedId) {
        const addedSensor: Sensor = {...sensor,};
        return Errors.okResult(addedSensor);
      } else {
        return Errors.errResult('Failed to add sensor to the database.', 'DB');
      }
    } catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
    // return Errors.errResult('todo', 'TODO');
  }

  /** Add sensorReading to this database.
   *  Error Codes: 
   *    EXISTS: reading for same sensorId and timestamp already in DB.
   *    DB: a database error was encountered.
   */
  async addSensorReading(sensorReading: SensorReading)
    : Promise<Errors.Result<SensorReading>> 
  {
    
    return Errors.errResult('todo', 'TODO');
  }

  /** Find sensor-types which satify search. Returns [] if none. 
   *  Note that all primitive SensorType fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensorTypes(search: SensorTypeSearch)
    : Promise<Errors.Result<SensorType[]>> 
  {

    return Errors.errResult('todo', 'TODO');
  }
  
  /** Find sensors which satify search. Returns [] if none. 
   *  Note that all primitive Sensor fields can be used to filter.
   *  The returned array must be sorted by sensor-type id.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensors(search: SensorSearch) : Promise<Errors.Result<Sensor[]>> {
    
    return Errors.errResult('todo', 'TODO');
  }

  /** Find sensor readings which satisfy search. Returns [] if none. 
   *  The returned array must be sorted by timestamp.
   *  Error Codes: 
   *    DB: a database error was encountered.
   */
  async findSensorReadings(search: SensorReadingSearch)
    : Promise<Errors.Result<SensorReading[]>> 
  {

    return Errors.errResult('todo', 'TODO');
  }
  
} //SensorsDao

//mongo err.code on inserting duplicate entry
const MONGO_DUPLICATE_CODE = 11000;

