# Base Package

Contains Postgres DB functionalities - connection, initialization, querying.

## DatabaseInitializer

DatabaseInitializer: manages creation of the logical DB, client('s), initial database tables and
providing all the privileges upon created tables and DB to the created users.

### Configuration of DatabaseInitializer

```javascript
import { DatabaseInitializer } from '@adp/base';

const initializer = new DatabaseInitializer({
  db: {
    admin,
    adminPassword,
    database,
    newUsers: [{ name, password }],
    tableQueries: [],
    sslSettings,
  },
  logger,
  fMHandler,
});
```

### Usage of DatabaseInitializer

?> In all of the following examples `databaseInitializer` mean configured
`DatabaseInitializer` instances.

For database initiation:

```javascript
await databaseInitializer.initDatabase();
```

## DBClient

DBClient: provides database querying functionality.

### Configuration of DBClient

```javascript
import { DBClient } from '@adp/base';

const client = new DBClient({
  dbConnectConfig: {
    user,
    password,
    host,
    port,
    ssl,
  },
  fMHandler,
  logger,
});
```

### Usage of DBClient

?> In all of the following examples `dBClient` mean configured
`DBClient` instances.

To make queries to db:

```javascript
await dBClient.connect();
await dBClient.runQuery(query);
await dBClient.close();
```

DBClient runQuery method requires valid SQL queries in String format as input.

The DBClient also inherits from `events.EventEmitter` and publishes the following events:

| Event name             | Emitted arguments                                                                     | Short description                                   |
| ---------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| idle-client-pool-error | `Object {error, client}` - Object containing error and the db pool client that failed | Emits by any of connection pool clients that failed |
