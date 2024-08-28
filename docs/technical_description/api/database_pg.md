# API documentation for database-pg package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>DatabaseInitializer</code>

**Kind**: global class

### <code>new DatabaseInitializer(options)</code>

Sets basic fields.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>options.db</var> | <code>object</code> | Username for the database. |
| <var>options.db.admin</var> | <code>string</code> | Username of the database admin. |
| <var>options.db.adminPassword</var> | <code>string</code> | Password of the database admin. |
| <var>options.db.newUsers</var> | <code>Array</code> | The array of {user, password} entries, to be used to create new database users. |
| <var>options.db.database</var> | <code>string</code> | Name of the database. |
| <var>options.db.host</var> | <code>string</code> | Database host name. |
| <var>options.db.port</var> | <code>string</code> | Database host port to connect to. |
| <var>options.db.tableQueries</var> | <code>Array</code> | The array of the table creation queries. |
| <var>options.db.sslSettings</var> | <code>object</code> | SSL settings used by the client. |
| <var>options.logger</var> | <code>object</code> | Logger instance used by the DatabaseInitializer. |
| <var>[options.fMHandler]</var> | <code>object</code> | FMHandler instance used by the DatabaseInitializer. |

### <code>databaseInitializer.\_createUser</code>

Creates a user for the database.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>client</var> | <code>object</code> | Psql client object. |
| <var>username</var> | <code>string</code> | Username. |
| <var>password</var> | <code>string</code> | Password. |

### <code>databaseInitializer.\_createDatabase</code>

Creates the database with the right owner.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>client</var> | <code>object</code> | Psql client object. |
| <var>DBName</var> | <code>string</code> | DB name. |
| <var>DBOwner</var> | <code>string</code> | DB owner. |

### <code>databaseInitializer.\_grantAllPrivileges</code>

Grants the privileges to the user on the given database.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>client</var> | <code>object</code> | Psql client object. |
| <var>db</var> | <code>string</code> | DB name. |
| <var>userName</var> | <code>string</code> | DB user to grant privileges to. |

### <code>databaseInitializer.\_createDBTablesInCustomDB</code>

Creates tables based on the given queries.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>client</var> | <code>object</code> | Psql client object. |
| <var>tableQueries</var> | <code>object</code> | The map describing table creation queries - tableName: tablePath. |

### <code>databaseInitializer.\_createDBConnection</code>

Establishes db connection.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)\
**Returns**: <code>Promise.&lt;object&gt;</code> - PostgreSQL client.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>config</var> | <code>object</code> | Psql client config object. |

### <code>databaseInitializer.initDatabase</code>

Initializes the whole database.

**Kind**: instance property of [`DatabaseInitializer`](#DatabaseInitializer)
