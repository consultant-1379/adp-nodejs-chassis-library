# Quick NPM task reference

npm run test # run all tests
npm run test:all # run all tests against all headless browsers (Chrome, Firefox and Safari).
npm run test:watch # run all tests against Chrome headless browser in watch mode.
npm run start # open demo page where components can be tested

## Demo page

Via demo page all components could be tested and viewed.
Start the page with `npm run start` command.

**Note** Whenever new components are added or existing ones are changed, component configuration for
the demo page should also be updated.
Detailed information about the configurations can be found [here](demo/overview/README.md)

## Debugging tests

Use "Start component tests in UI-Components" launch configuration. You can add breakpoints after
focusing on a file (press F) and / or debugging in browser (press D).
