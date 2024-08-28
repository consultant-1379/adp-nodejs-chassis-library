import pg from 'pg';
import * as fs from 'fs';

const LOGGER = Symbol('LOGGER');
const FM = Symbol('FM');

class DatabaseInitializer {
  /**
   * Sets basic fields.
   *
   * @param {object} options - Set of options.
   * @param {object} options.db - Username for the database.
   * @param {string} options.db.admin - Username of the database admin.
   * @param {string} options.db.adminPassword - Password of the database admin.
   * @param {Array} options.db.newUsers - The array of {user, password} entries, to be used to create new database users.
   * @param {string} options.db.database - Name of the database.
   * @param {string} options.db.host - Database host name.
   * @param {string} options.db.port - Database host port to connect to.
   * @param {Array} options.db.tableQueries - The array of the table creation queries.
   * @param {object} options.db.sslSettings - SSL settings used by the client.
   * @param {object} options.logger - Logger instance used by the DatabaseInitializer.
   * @param {object} [options.fMHandler] - FMHandler instance used by the DatabaseInitializer.
   */

  constructor(options) {
    const {
      db: { admin, adminPassword, database, host, port, tableQueries, sslSettings, newUsers = [] },
      logger,
      fMHandler,
    } = options;
    this.admin = admin;
    this.adminPassword = adminPassword;
    this.newUsers = newUsers;
    this.host = host;
    this.port = port;
    this.database = database;
    this.tableQueries = tableQueries;
    this.sslSettings = sslSettings;
    this[LOGGER] = logger;
    this[FM] = fMHandler;
  }

  /**
   * Creates a user for the database.
   *
   * @param {object} client - Psql client object.
   * @param {string} username - Username.
   * @param {string} password - Password.
   */
  _createUser = async (client, username, password) => {
    const createUserQuery = `CREATE USER "${username}" WITH PASSWORD '${password}' ;`;
    try {
      this[LOGGER].info('Creating user;');
      await client.query(createUserQuery);
    } catch (error) {
      this[LOGGER].info(`User creation failed: ${error.name} - ${error.message}. Step skipped.`);
    }
  };

  /**
   * Creates the database with the right owner.
   *
   * @param { object } client - Psql client object.
   * @param { string } DBName - DB name.
   * @param { string } DBOwner - DB owner.
   */
  _createDatabase = async (client, DBName, DBOwner) => {
    const createDBQuery = `CREATE DATABASE "${DBName}" OWNER '${DBOwner}';`;
    try {
      this[LOGGER].info(`Creating DB;`);
      await client.query(createDBQuery);
    } catch (error) {
      this[LOGGER].info(
        `Logical DB creation failed: ${error.name} - ${error.message}. Step skipped.`,
      );
    }
  };

  /**
   * Grants the privileges to the user on the given database.
   *
   * @param { object } client - Psql client object.
   * @param { string } db - DB name.
   * @param { string } userName - DB user to grant privileges to.
   */
  _grantAllPrivileges = async (client, db, userName, tableQueries) => {
    const grantPrivilegesQuery = `GRANT ALL PRIVILEGES ON DATABASE "${db}" TO "${userName}";`;
    const sequencesPrivileges = `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${userName}";`;

    try {
      this[LOGGER].info('Granting all privileges to the created user;');
      await client.query(grantPrivilegesQuery);
      await client.query(sequencesPrivileges);

      for (const tableName of Object.keys(tableQueries)) {
        const grantTablePrivilegesQuery = `GRANT ALL PRIVILEGES ON TABLE "${tableName}" TO "${userName}";`;
        // eslint-disable-next-line no-await-in-loop
        await client.query(grantTablePrivilegesQuery);
      }
    } catch (error) {
      this[LOGGER].info(
        `Granting privileges to the user failed: ${error.name} - ${error.message}. Step skipped.`,
      );
    }
  };

  /**
   * Creates tables based on the given queries.
   *
   * @param { object } client - Psql client object.
   * @param { object } tableQueries - The map describing table creation queries - tableName: tablePath.
   */
  _createDBTablesInCustomDB = async (client, tableQueries) => {
    let queryCommand;
    this[LOGGER].info('Creating DB tables;');
    for (const filePath of Object.values(tableQueries)) {
      try {
        queryCommand = fs.readFileSync(filePath, { encoding: 'utf-8' });
        // eslint-disable-next-line no-await-in-loop
        await client.query(queryCommand);
      } catch (error) {
        this[FM]?.produceFaultIndication({
          fault: 'DB_ERROR',
          customConfig: {
            description: `Error during DB initiation - DB tables creation failed`,
          },
        });
        this[LOGGER].error(
          `Creating DB tables failed: ${error.name} - ${error.message}. Step skipped.`,
        );
      }
    }
  };

  _getConfig = (sslSettings) => {
    const config = {
      user: this.admin,
      password: this.adminPassword,
      host: this.host,
      port: this.port,
    };
    if (sslSettings) {
      return {
        ...config,
        ...sslSettings,
      };
    }
    this[LOGGER].info(
      'No TLS certificates provided, using DB superuser credentials for connection establishment.',
    );
    return config;
  };

  /**
   * Establishes db connection.
   *
   * @param { object } config - Psql client config object.
   * @returns { Promise<object> } PostgreSQL client.
   */
  _createDBConnection = async (config) => {
    const { Client } = pg;
    const client = new Client(config);

    try {
      this[LOGGER].info(`Attempting to create DB connection...`);
      await client.connect();
    } catch (error) {
      this[FM]?.produceFaultIndication({
        fault: 'DB_ERROR',
        customConfig: {
          description: `Error during DB initiation - establishing DB connection failed`,
        },
      });
      this[LOGGER].error(`Connection failed: ${error.name} - ${error.message}.`);

      process.exit(1);
    }
    this[LOGGER].info('Connected.');
    return client;
  };

  /**
   * Initializes the whole database.
   */
  initDatabase = async () => {
    const config = this._getConfig(this.sslSettings);
    // connecting to the initial database ('postgres' by default)
    const adminClient = await this._createDBConnection(config);

    await this._createDatabase(adminClient, this.database, this.admin);
    for (const { user, password } of this.newUsers) {
      // eslint-disable-next-line no-await-in-loop
      await this._createUser(adminClient, user, password);
    }

    this[LOGGER].info('Closing default database connection;');
    await adminClient.end();

    this[LOGGER].info('Re-connecting to the custom database;');
    config.database = this.database;
    const customDBClient = await this._createDBConnection(config);

    await this._createDBTablesInCustomDB(customDBClient, this.tableQueries);

    for (const { user } of this.newUsers) {
      // eslint-disable-next-line no-await-in-loop
      await this._grantAllPrivileges(customDBClient, this.database, user, this.tableQueries);
    }
    this[LOGGER].info('Closing DB connection.');
    await customDBClient.end();
  };
}

export default DatabaseInitializer;
