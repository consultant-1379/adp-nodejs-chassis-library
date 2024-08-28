# API documentation for ui-components package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>ActionBar</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ActionBar()</code>

Component ActionBar is defined as `<e-action-bar>`.

**Example**

```js
// Imperatively create component
let component = new ActionBar();

// Declaratively create component
<e-action-bar></e-action-bar>
```

## <code>AppCard</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new AppCard()</code>

Component AppCard is defined as `<e-app-card>`.

**Example**

```js
// Imperatively create component.
let component = new AppCard();

// Declaratively create component
<e-app-card></<e-app-card>
```

## <code>BaseLink</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new BaseLink()</code>

Component is defined as `<e-base-link>`.

**Example**

```js
// Imperatively create component.
let component = new BaseLink();

// Declaratively create component
<e-base-link></e-base-link>
```

## <code>CardContainer</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new CardContainer()</code>

Component CardContainer is defined as `<e-card-container>`.

**Example**

```js
// Imperatively create component.
let component = new CardContainer();

// Declaratively create component
<e-card-container></e-card-container>
```

## <code>CardMenu</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new CardMenu()</code>

Component is defined as `<e-card-menu>`.

**Example**

```js
// Imperatively create component.
let component = new CardMenu();

// Declaratively create component
<e-card-menu></e-card-menu>
```

## <code>CustomLayoutCard</code>

**Kind**: global class\
**Extends**: <code>Card</code>

### <code>new CustomLayoutCard()</code>

Component is defined as `<e-custom-layout-card>`.

**Example**

```js
// Imperatively create component.
let component = new CustomLayoutCard();

// Declaratively create component
<e-custom-layout-card></e-custom-layout-card>
```

## <code>ErrorMessageContent</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ErrorMessageContent()</code>

Component ErrorMessageContent is defined as `<e-error-message-content>`.

**Example**

```js
// Imperatively create component
let component = new ErrorMessageContent();

// Declaratively create component
<e-error-message-content></e-error-message-content>
```

## <code>ErrorMessage</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ErrorMessage()</code>

Component ErrorMessage is defined as `<e-error-message>`.

**Example**

```js
// Imperatively create component
let component = new ErrorMessage();

// Declaratively create component
<e-error-message></e-error-message>
```

## <code>GroupableComboBox</code>

**Kind**: global class\
**Extends**: <code>ComboBox</code>

### <code>new GroupableComboBox()</code>

Component GroupableComboBox is defined as `<e-groupable-combo-box>`.

**Example**

```js
// Imperatively create component:
let component = new GroupableComboBox();

// Declaratively create component:
<e-groupable-combo-box></e-groupable-combo-box>
```

### <code>groupableComboBox.show</code>

Make ComboBox menu visible.

**Kind**: instance property of [`GroupableComboBox`](#GroupableComboBox)

### <code>groupableComboBox.handleIconClick</code>

Handle icon click.

**Kind**: instance property of [`GroupableComboBox`](#GroupableComboBox)

### <code>groupableComboBox.\_makeDropdownOptions()</code>

Create ComboBox menu items.

**Kind**: instance method of [`GroupableComboBox`](#GroupableComboBox)\
**Returns**: <code>object</code> - The rendered items.

### <code>groupableComboBox.handleEvent(event)</code>

Handle events and clear ComboBox when a menuItem is clicked.

**Kind**: instance method of [`GroupableComboBox`](#GroupableComboBox)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>event</var> | <code>Event</code> | An event. |

### <code>groupableComboBox.didChangeProps(changedProps)</code>

Override of ComboBox didChangeProps hook to fix a bug with the 'noResultLabel' case.
`.empty` element is not always exists as it is created in `showFilteredList` method only.
Be cautious when increasing the @eui/base package version.

- WA is to handle the non-existent `.empty` element.
- Bug on EUISDK: CDS-9791.

**Kind**: instance method of [`GroupableComboBox`](#GroupableComboBox)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>changedProps</var> | <code>object</code> | Map containing changed props. |

### <code>groupableComboBox.render()</code>

Override of ComboBox render method to support cross icon with different functionality.

Be cautious when increasing the @eui/base package version as changes in ComboBox source can break search functionality!

**Kind**: instance method of [`GroupableComboBox`](#GroupableComboBox)\
**Returns**: <code>object</code> - The rendered component.

## <code>IconDropdown</code>

**Kind**: global class\
**Extends**: <code>Dropdown</code>

### <code>new IconDropdown()</code>

Component IconDropdown is defined as `<e-icon-dropdown>`.

**Example**

```js
// Imperatively create component
let component = new IconDropdown();

// Declaratively create component
<e-icon-dropdown></e-icon-dropdown>
```

### <code>iconDropdown.\_setDropdownLabel()</code>

Set dropdown label icon.

**Kind**: instance method of [`IconDropdown`](#IconDropdown)

## <code>ListContainer</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ListContainer()</code>

Component ListContainer is defined as `<e-list-container>`.

**Example**

```js
// Imperatively create component.
let component = new ListContainer();

// Declaratively create component
<e-list-container></e-list-container>
```

## <code>ListItem</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ListItem()</code>

Component ListItem is defined as `<e-list-item>`.

**Example**

```js
//Imperatively create component.
let component = new ListItem();

//Declaratively create component
<e-list-item></e-list-item>
```

## <code>ProductCard</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new ProductCard()</code>

Component ProductCard is defined as `<e-product-card>`.

**Example**

```js
// Imperatively create component.
let component = new ProductCard();

// Declaratively create component
<e-product-card></e-product-card>
```

## <code>SearchComponent</code>

**Kind**: global class\
**Extends**: <code>LitComponent</code>

### <code>new SearchComponent()</code>

Component SearchComponent is defined as `<e-search-component>`.

**Example**

```js
// Imperatively create component.
let component = new SearchComponent();

// Declaratively create component.
<e-search-component></e-search-component>
```
