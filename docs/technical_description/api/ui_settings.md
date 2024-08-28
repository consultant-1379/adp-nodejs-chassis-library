# API documentation for ui-settings package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>BrowserStorage</code>

Class to manage UI Settings in localStorage mode.

**Kind**: global class

### <code>new BrowserStorage(username)</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>username</var> | <code>string</code> | The name of the user. |

### <code>browserStorage.getItem(params)</code>

Get an item from localStorage saved per user.

**Kind**: instance method of [`BrowserStorage`](#BrowserStorage)\
**Returns**: <code>\*</code> - The value of the given key found in localStorage per user.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |

### <code>browserStorage.setItem(params)</code>

Save an item into the localStorage per user.

**Kind**: instance method of [`BrowserStorage`](#BrowserStorage)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |
| <var>params.value</var> | <code>\*</code> | The value of the given key. |

### <code>browserStorage.removeItem(params)</code>

Removes the key-value pair from localStorage if exist per user.

**Kind**: instance method of [`BrowserStorage`](#BrowserStorage)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |

## <code>DBStorage</code>

Class to manage UI Settings in DB mode.

**Kind**: global class

### <code>new DBStorage(config)</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>config</var> | <code>object</code> | Init config. |
| <var>config.baseUrl</var> | <code>string</code> | Base URL of the UIS Service. |
| <var>[config.logger]</var> | <code>object</code> | Logger. |

### <code>dbStorage.getItem(params)</code>

Get the setting for a user from the storage.

**Kind**: instance method of [`DBStorage`](#DBStorage)\
**Returns**: <code>Promise.&lt;any&gt;</code> - The value of the given key found in the storage per user.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Needed parameters for the get() method. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the setting. |
| <var>params.key</var> | <code>string</code> | The identifier of the setting. |

### <code>dbStorage.setItem(params)</code>

Save the setting for a user into the storage.

**Kind**: instance method of [`DBStorage`](#DBStorage)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Needed parameters for the set() method. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the setting. |
| <var>params.key</var> | <code>string</code> | The identifier of the setting. |
| <var>params.value</var> | <code>\*</code> | The value of the given setting. |

### <code>dbStorage.removeItem(params)</code>

Removes the setting for a user from the storage if exist.

**Kind**: instance method of [`DBStorage`](#DBStorage)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Needed parameters for the remove() method. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the setting. |
| <var>params.key</var> | <code>string</code> | The identifier of the setting. |

## <code>UISettings</code>

Class to manage UI Settings.

**Kind**: global class

### <code>new UISettings(config)</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>config</var> | <code>object</code> | Init config. |
| <var>config.broadcastChannel</var> | <code>BroadcastChannel</code> | The broadcastChannel instance. |
| <var>config.username</var> | <code>string</code> | The name of the user. |
| <var>config.storageMode</var> | <code>string</code> | Mode of the storage, uiSettingsService or localStorage. |
| <var>[config.baseUrl]</var> | <code>string</code> | Base URL of the UIS Service. |
| <var>[config.logger]</var> | <code>object</code> | Logger. |

### <code>uiSettings.get(params)</code>

Get an item from localStorage saved per user.

**Kind**: instance method of [`UISettings`](#UISettings)\
**Returns**: <code>Promise.&lt;any&gt;</code> - The value of the given key found in the storage per user.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |

### <code>uiSettings.set(params)</code>

Save an item into the localStorage per user.

**Kind**: instance method of [`UISettings`](#UISettings)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |
| <var>params.value</var> | <code>\*</code> | The value of the given key. |

### <code>uiSettings.remove(params)</code>

Removes the key-value pair from localStorage if exist per user.

**Kind**: instance method of [`UISettings`](#UISettings)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Parameters. |
| <var>params.namespace</var> | <code>string</code> | The namespace of the item. |
| <var>params.key</var> | <code>string</code> | The identifier of the item. |
