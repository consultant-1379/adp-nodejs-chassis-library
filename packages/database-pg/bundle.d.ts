/// <reference types="node" />
declare module "psql/DatabaseInitializer" {
    export default DatabaseInitializer;
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
        constructor(options: {
            db: {
                admin: string;
                adminPassword: string;
                newUsers: any[];
                database: string;
                host: string;
                port: string;
                tableQueries: any[];
                sslSettings: object;
            };
            logger: object;
            fMHandler?: object;
        });
        admin: string;
        adminPassword: string;
        newUsers: any[];
        host: string;
        port: string;
        database: string;
        tableQueries: any[];
        sslSettings: any;
        /**
         * Creates a user for the database.
         *
         * @param {object} client - Psql client object.
         * @param {string} username - Username.
         * @param {string} password - Password.
         */
        _createUser: (client: object, username: string, password: string) => Promise<void>;
        /**
         * Creates the database with the right owner.
         *
         * @param { object } client - Psql client object.
         * @param { string } DBName - DB name.
         * @param { string } DBOwner - DB owner.
         */
        _createDatabase: (client: object, DBName: string, DBOwner: string) => Promise<void>;
        /**
         * Grants the privileges to the user on the given database.
         *
         * @param { object } client - Psql client object.
         * @param { string } db - DB name.
         * @param { string } userName - DB user to grant privileges to.
         */
        _grantAllPrivileges: (client: object, db: string, userName: string, tableQueries: any) => Promise<void>;
        /**
         * Creates tables based on the given queries.
         *
         * @param { object } client - Psql client object.
         * @param { object } tableQueries - The map describing table creation queries - tableName: tablePath.
         */
        _createDBTablesInCustomDB: (client: object, tableQueries: object) => Promise<void>;
        _getConfig: (sslSettings: any) => any;
        /**
         * Establishes db connection.
         *
         * @param { object } config - Psql client config object.
         * @returns { Promise<object> } PostgreSQL client.
         */
        _createDBConnection: (config: object) => Promise<object>;
        /**
         * Initializes the whole database.
         */
        initDatabase: () => Promise<void>;
        [LOGGER]: any;
        [FM]: any;
    }
    const LOGGER: unique symbol;
    const FM: unique symbol;
}
declare module "psql/DBClient" {
    export default class DBClient extends EventEmitter<[never]> {
        constructor(config: any);
        dbConnectConfig: any;
        connect(): Promise<any>;
        runQuery(query: any): Promise<any>;
        _pool: any;
        updateConnection(config: any): Promise<void>;
        close(): Promise<void>;
        [FM]: any;
        [LOGGER]: any;
    }
    import EventEmitter from "events";
    const FM: unique symbol;
    const LOGGER: unique symbol;
    export {};
}
declare module "index" {
    import DatabaseInitializer from "psql/DatabaseInitializer";
    import DBClient from "psql/DBClient";
    export { DatabaseInitializer, DBClient };
}
