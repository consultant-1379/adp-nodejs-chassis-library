# Ericsson Chassis Library UI Components Demo page

Demo page to display all custom ui components and their possible settings. This is the documentation
for describing all the parameters and possible configurations of the components.

## Overview

This is an instruction on how to add configurations to show a newly added component to the demo page.

**Note** An important condition for the correct page functioning is the standardized naming of
components and their location. The directory and the file that exports component class must be named
after the component, but without an `e-` prefix, and located as follows:
`src/components/[component-name]/[component-name].js`.
For example, for the `<e-base-link>` component, the path is `src/components/base-link/base-link.js`.

**Note** Further, by component name will be meant its name without the prefix `e-` (i.e., the name
of the file/directory with the direct code).

## Setting up a new component

### Configuration file

Add the configuration file named `[component-name]-config.js` to the folder `demo/overview/config`.
For example, for the `<e-base-link>` component, this file is named `base-link-config.js`.
The configuration should export an object with the next properties:

- `props`
- `events`
- `slots`
- `examples`

The resulting file may look like this:

```js
const EXAMPLE_CODE_1 = `
<e-base-link url="/#main-page/app-card" new-tab>
  <span slot="content">I'm clickable. Try click on me :)</span>
</e-base-link>
`;

const EXAMPLE_PROPS_1 = {
  url: '/#main-page/app-card',
  newTab: true,
};

export default {
  props: [
    {
      name: 'url',
      type: 'String',
      attribute: 'true',
      default: "''",
      description: 'Link to open.',
    },
    {
      name: 'newTab',
      type: 'Boolean',
      attribute: 'true',
      default: 'false',
      description: 'Whether open link in a new browser tab.',
    },
  ],
  events: [
    {
      name: 'click',
      description: 'Triggered each time the element is clicked.',
    },
  ],
  slots: [
    {
      name: 'content',
      description:
        'Named slot. This is a placeholder for content to be wrapped by link and become clickable.',
    },
  ],
  examples: [{ code: EXAMPLE_CODE_1 }, { props: EXAMPLE_PROPS_1 }],
};
```

### Navigation menu

Then add the component to the menu of the demo page. To do this, in the `public/config.json` file,
add a section, describing the component, to the _apps_ property. The fields of the section are as
follows:

- `name` - component name
- `module` - `main-page` (constant)
- `displayName` - full component name (with `e-` prefix)
- `route` - component name
- `isComponent` - `true` (constant)

Also, add the created item to the _Component page_ category of the navigation menu: add the
component name to the `childNames` property of the _main-page_ app.

As an example, again, look at how base-link is described:

```json
{
  "apps": [
    {
      "name": "main-page",
      "module": "main-page",
      "displayName": "Component page",
      "type": "euisdk",
      "route": "main-page",
      "childNames": [
        ...
        "base-link",
        ...
      ]
    },
    ...
    {
      "name": "base-link",
      "module": "main-page",
      "displayName": "e-base-link",
      "route": "base-link",
      "isComponent": true
    },
    ...
  ]
}
```
