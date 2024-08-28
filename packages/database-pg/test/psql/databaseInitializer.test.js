import * as td from 'testdouble';

const SQL_FILES = {
  schemaVersionTable: '/mocks/schemaVersionTable.sql',
  namespaceTable: '/mocks/namespaceTable.sql',
  settingTable: '/mocks/settingTable.sql',
};

const querySpy = td.func();
const connectSpy = td.func();
const endSpy = td.func();
const produceFaultSpy = td.func();

const pgMock = {
  Client: class {
    query = (req) => {
      querySpy(req);
    };

    connect = connectSpy;

    end = endSpy;
  },
};

const fmHandlerMock = {
  produceFaultIndication: produceFaultSpy,
};

const loggerMock = td.object(['error', 'info', 'debug']);

const CREATE_TABLE_QUERIES = [
  `CREATE TABLE IF NOT EXISTS db_schema_version (
    version varchar(255)
);`,
  `CREATE TABLE IF NOT EXISTS namespace (
  id serial NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);`,
  `CREATE TABLE IF NOT EXISTS setting (
  id serial NOT NULL PRIMARY KEY,
  namespace_id INTEGER NOT NULL,
  username VARCHAR(2550) NULL,
  type VARCHAR(255) NOT NULL,
  name VARCHAR(2550) NOT NULL,
  value TEXT NULL,
  created TIMESTAMP NOT NULL,
  modified TIMESTAMP NOT NULL,
  last_accessed TIMESTAMP NOT NULL,
  FOREIGN KEY (namespace_id)
    REFERENCES namespace (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);`,
];
const fsMock = () => ({
  readFileSync: (filePath) => {
    switch (filePath) {
      case SQL_FILES.schemaVersionTable:
        return CREATE_TABLE_QUERIES[0];
      case SQL_FILES.namespaceTable:
        return CREATE_TABLE_QUERIES[1];
      case SQL_FILES.settingTable:
        return CREATE_TABLE_QUERIES[2];
      default:
        return '';
    }
  },
});

const sslSettings = {
  ssl: {
    rejectUnauthorized: false,
    ca: 'cacertbundle.pem',
    key: 'key.pem',
    cert: 'cert.pem',
  },
};

const tableQueries = [
  SQL_FILES.schemaVersionTable,
  SQL_FILES.namespaceTable,
  SQL_FILES.settingTable,
];

let databaseInitializer;
let DatabaseInitializer;
let processExitMock;

const mockModules = async (logger = loggerMock, pg = pgMock, fMHandler = fmHandlerMock) => {
  await td.replaceEsm('fs', fsMock());
  await td.replaceEsm('pg', null, pg);
  processExitMock = await td.replace(process, 'exit');
  DatabaseInitializer = (await import('../../src/psql/DatabaseInitializer.js')).default;
  databaseInitializer = new DatabaseInitializer({
    db: {
      admin: 'mockAdmin',
      adminPassword: 'mockAdminPassword',
      database: 'mockDatabase',
      tableQueries,
      sslSettings,
      newUsers: [
        { user: 'mockUser', password: 'mockUserPassword' },
        { user: 'mockUser1', password: 'mockUserPassword1' },
      ],
    },
    logger,
    fMHandler,
  });
};
describe('Unit tests for DatabaseInitializer.js', async () => {
  describe('works as intended', async () => {
    before(async () => {
      await mockModules();
      await databaseInitializer.initDatabase();
    });
    after(() => {
      td.reset();
    });
    it('can create user', () => {
      td.verify(querySpy('CREATE USER "mockUser" WITH PASSWORD \'mockUserPassword\' ;'), {
        times: 1,
      });
      td.verify(querySpy('CREATE USER "mockUser1" WITH PASSWORD \'mockUserPassword1\' ;'), {
        times: 1,
      });
    });
    it('can create database', () => {
      td.verify(querySpy('CREATE DATABASE "mockDatabase" OWNER \'mockAdmin\';'), {
        times: 1,
      });
    });
    it('can grant all privileges', () => {
      td.verify(querySpy('GRANT ALL PRIVILEGES ON DATABASE "mockDatabase" TO "mockUser";'), {
        times: 1,
      });
      td.verify(querySpy('GRANT ALL PRIVILEGES ON DATABASE "mockDatabase" TO "mockUser1";'), {
        times: 1,
      });
    });
    it('can create db tables', () => {
      td.verify(querySpy(CREATE_TABLE_QUERIES[0]), {
        times: 1,
      });
      td.verify(querySpy(CREATE_TABLE_QUERIES[1]), {
        times: 1,
      });
      td.verify(querySpy(CREATE_TABLE_QUERIES[2]), {
        times: 1,
      });
    });
    it('can create db connection', () => {
      td.verify(connectSpy(), { times: 2 });
    });
    it('can end db connection', () => {
      td.verify(endSpy(), { times: 2 });
    });
  });

  describe('handles errors', async () => {
    beforeEach(async () => {
      await mockModules();
    });
    afterEach(() => {
      td.reset();
    });

    it('when db connection is rejected', async () => {
      td.when(connectSpy()).thenReject({ name: 'conn_error', message: 'internal server error' });
      await databaseInitializer.initDatabase();
      td.verify(loggerMock.error('Connection failed: conn_error - internal server error.'));
      td.verify(processExitMock(1));
      td.verify(
        produceFaultSpy(
          td.matchers.contains({
            customConfig: {
              description: td.matchers.contains('establishing DB connection failed'),
            },
          }),
        ),
      );
    });

    it('when DB query has failed', async () => {
      await mockModules();
      td.when(querySpy(td.matchers.anything())).thenThrow({
        name: 'db_query_error',
        message: 'db query has failed',
      });
      await databaseInitializer.initDatabase();
      td.verify(loggerMock.info(td.matchers.contains('User creation failed')));
      td.verify(loggerMock.info(td.matchers.contains('Logical DB creation failed')));
      td.verify(loggerMock.info(td.matchers.contains('Granting privileges to the user failed')));
      td.verify(
        produceFaultSpy(
          td.matchers.contains({
            customConfig: {
              description: td.matchers.contains('DB tables creation failed'),
            },
          }),
        ),
      );
    });
  });
});
