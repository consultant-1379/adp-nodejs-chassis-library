import pg from 'pg';
import EventEmitter from 'events';

const LOGGER = Symbol('LOGGER');
const FM = Symbol('FM');

export default class DBClient extends EventEmitter {
  constructor(config) {
    super();
    const { fMHandler, logger, dbConnectConfig } = config;
    this.dbConnectConfig = dbConnectConfig;
    this[FM] = fMHandler;
    this[LOGGER] = logger;
  }

  async connect() {
    const { Pool } = pg;
    let pool;

    try {
      pool = await new Pool(this.dbConnectConfig);
    } catch (error) {
      this[LOGGER].error(`Error creating connection pool`);
      this[FM]?.produceFaultIndication({
        fault: 'DB_ERROR',
        customConfig: {
          description: `Error creating connection pool`,
        },
      });
      throw new Error(`Pool creation failed. ${error}`);
    }

    pool.on('error', (error, client) => {
      this[LOGGER].error(`Unexpected error on idle client ${client}`);
      this.emit('idle-client-pool-error', { error, client });
    });

    return pool;
  }

  async runQuery(query) {
    if (!this._pool) {
      this._pool = await this.connect();
    }
    let result;

    try {
      this[LOGGER].debug(`Performing query: ${query}`);
      result = await this._pool.query(query);
    } catch (error) {
      this[LOGGER].error(`Query failed: ${error}`);
      this[FM]?.produceFaultIndication({
        fault: 'DB_ERROR',
        customConfig: {
          description: `Error performing DB query, ${error}`,
        },
      });
      throw new Error(`Query failed: ${error}`);
    }

    return result;
  }

  async updateConnection(config) {
    const { dbConnectConfig } = config;
    this.dbConnectConfig = dbConnectConfig;
    await this.close();
  }

  async close() {
    try {
      if (this._pool) {
        await this._pool.end();
        this._pool = null;
      }
    } catch (error) {
      this[LOGGER].error(`DB client closing failed: ${error}`);
      this[FM]?.produceFaultIndication({
        fault: 'DB_ERROR',
        customConfig: {
          description: `Error closing DB client, ${error}`,
        },
      });
      throw new Error(`DBClient failed closing connection pool, ${error}`);
    }
  }
}
