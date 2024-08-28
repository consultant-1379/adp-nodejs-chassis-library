# Documentation

The documentation is based on [Markdown](https://www.markdownguide.org/basic-syntax/) format.

## Docsify

For better user and developer experience the pages can be viewed with [docsify](https://docsify.js.org/).
This is a VueJS based SPA which generates an online documentation from Markdown files.
Currently docsify is configured to include JS and CSS files from external CDN-s, It is suitable for
most developer to check the documentation on their own machine.

It is recommended to install `docsify-cli` globally, which helps initializing and previewing
the website locally.

```bash
npm i docsify-cli -g
```

To preview your site, run the local server with `docsify serve`.
You can preview your site in your browser on `http://localhost:3000`. The files are watched by the server
any changes is instantly visible.

```bash
docsify serve docs
```

!> Currently, docsify can be run on Node.js version 14 or less

The docsify configuration is in the `index.html`. Here you can configure the documentation engine
add new plugins or modify the styles.

!> The `relativePath: true` setting is important as it makes docsify to work similarly
as Gitiles and ADP Marketplace docs.

The files starting with `_` are used for navigational and other internal configuration purposes
in docsify. The left side navigation is defined by `_sidebar.md` and it has to be updated manually
if a new file is created. The top navigation is generated from `_navbar.md`.

?> For information and warning block use the !> or ?> tags.

Used plugins:

- Copy-code - adds the copy to clipboard button to every code block
- Darklight-Theme + Themeable - adds a dark-light theme switcher button and a highly customizable theme
- Search - adds a local search feature

Plugins which could improve docsify experience:

- <https://docsify.js.org/#/awesome?id=plugins>
- <https://mermaid-js.github.io/mermaid/#/README>
- <https://docsify.js.org/#/markdown?id=supports-mermaid>
- <https://jhildenbiddle.github.io/docsify-themeable/#/introduction>
- <https://upupming.site/docsify-katex/docs/#/>

## API documentation

API documentation is generated for each package using JSDoc syntax. Therefore, every \*.js file with
exported classes/functions must be described properly.

At the moment the most commonly used tags are implemented:

- [@module](https://jsdoc.app/tags-module.html)
- [@alias](https://jsdoc.app/tags-alias.html)
- [@deprecated](https://jsdoc.app/tags-deprecated.html)
- [@extends](https://jsdoc.app/tags-augments.html)
- [@param](https://jsdoc.app/tags-param.html)
- [@returns](https://jsdoc.app/tags-returns.html)
- [@throws](https://jsdoc.app/tags-throws.html)
- [@typedef](https://jsdoc.app/tags-typedef.html)
- [@property](https://jsdoc.app/tags-property.html)
- [@link](https://jsdoc.app/tags-inline-link.html)

Documentation is generated with the
[jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) Node.js package.
The [Handlebars](https://handlebarsjs.com/) package is used to markup the template. The `template`
parameter sets the template for the whole package's documentation, `partial` parameter is used
to pass your own partial templates and to overwrite the default templates:

```js
const apiDocData = await jsdoc2md.render({
  files: 'packages/base/src/**/*.js',
  partial: [
    'docs/technical_description/templates/partials/body.hbs',
    'docs/technical_description/templates/partials/new-partial.hbs',
  ],
  template: 'docs/technical_description/templates/package-api.hbs',
});
```

The default partials could be found in a
[dmd](https://github.com/jsdoc2md/dmd/tree/master/partials) package, which compiles the template.

## Markdown-include Example

An example how to include document fragments into different md files.

1. Create fragment-example.md
2. Add it to the target md file:

```text
# Main title

...

## Subtitle

{!fragment-example.md!}

...
## Other title

```

## Markdown linting with Vale

Vale is a command-line tool that brings code-like linting to prose. See details at [Github](https://github.com/errata-ai/vale/blob/v2/README.md).

Developers are advised to run Vale locally (either via bob (`bob lint:vale`), or after installing Vale
locally) after changing .md files, to keep them tidy.

Vale is ran by the precodereview and Drop pipelines too, and is currently set up to point out
(and fail on) errors only. The custom vocabulary of the project can be expanded as necessary by adding
entries to `docs\styles\Vocab\EEA4_custom_terms\accept.txt`. Keep in mind that entries are case sensitive.

To use Vale with VS Code follow these steps ([Form the docs](https://github.com/errata-ai/vale-vscode#using-vale)):

1. install vale locally\
   Windows: `choco install vale`\
   Linux: `brew install vale`
2. install `errata-ai.vale-server` VS Code extension
3. set `vale.core.useCLI` to `true` in the VS Code settings (already done in the project settings)
4. restart VS Code.

_Note:_ the spellcheck only runs after the markdown file is saved.

## ADP Marketplace

The documentation for the marketplace is stored under the `docs/marketplace` directory. In the drop
pipeline the \*.md files are covered to HTML, zipped together, uploaded to an ARM repository and
then refreshed on the marketplace.

Currently there are two config files (`marketplace_*.yaml`) for the conversion and for the upload
phases in this directory. If the file structure is changed then update these.

For reference check the [Marketplace uploader](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob-adp-release-auto/+/refs/heads/master/marketplace/#Marketplace-Uploader).

!> These documents are uploaded to the ADP Marketplace so please use only supported markdown syntax.
Even if these docs can be visualized by Docsify, don't use special tags like ?> or !>

## Gerrit - Gitiles

Gerrit thorough the [Gitiles](https://gerrit.googlesource.com/gitiles/) plugin provides a webview
for git repositories. Gitiles automatically renders \*.md Markdown files into HTML for simplified
documentation. By this the repository can be used as a shareable documentation for developers.
For example check the landing page of [Gerrit repository](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/EEA/adp-nodejs-microservice-chassis/)

Files named `README.md` are automatically displayed below the file's directory listing.

?> README.md files are meant to provide orientation for developers browsing the repository,
especially for first-time users.

For reference check [Markdown support in Gitiles](https://gerrit.googlesource.com/gitiles/+/HEAD/Documentation/markdown.md)
