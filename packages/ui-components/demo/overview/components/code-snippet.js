import { definition, LitComponent, html } from '@eui/lit-component';
import { Tooltip } from '@eui/base';
import { Icon } from '@eui/theme';
import style from './code-snippet.css';

class CodeSnippet extends LitComponent {
  static get components() {
    return {
      'eui-icon': Icon,
      'eui-tooltip': Tooltip,
    };
  }

  didRender() {
    this._updateCodeSnippet();
  }

  _updateCodeSnippet() {
    const { code, props } = this.example || {};
    this.code = code || this._getCode(props);
    this.language = (code && 'html') || (props && 'javascript');

    // eslint-disable-next-line no-undef
    this.shadowRoot.querySelector('code').innerHTML = Prism.highlight(
      this.code.trim(),
      // eslint-disable-next-line no-undef
      Prism.languages[this.language],
      this.language,
    );
  }

  _getCode(props) {
    if (!props) {
      console.warning('props are empty, code snippet will not be shown');
      return '';
    }

    const tabSpace = '  ';
    const firstReturnRow = 'return html`';
    const lastReturnRow = '`;';
    const firstComponentRow = `${tabSpace}<e-${this.componentName}`;
    const lastComponentRow = `${tabSpace}></e-${this.componentName}>`;
    const newLine = '\n';
    const variableRows = [];
    const componentAttrRows = [];

    Object.keys(props).forEach((propertyName) => {
      variableRows.push(this._getVarRow(propertyName, props[propertyName]));
      componentAttrRows.push(`${tabSpace}${tabSpace}.${propertyName}=$\{${propertyName}}`);
    });

    const componentRows = [
      firstReturnRow,
      firstComponentRow,
      ...componentAttrRows,
      lastComponentRow,
      lastReturnRow,
    ];
    const codeRows = [...variableRows, newLine, ...componentRows];

    return codeRows.join('\n');
  }

  _getVarRow(propertyName, value) {
    switch (typeof value) {
      case 'string':
        return `const ${propertyName}='${value}';`;
      case 'object':
        return `const ${propertyName}=${JSON.stringify(value)};`;
      default:
        return `const ${propertyName}=${value};`;
    }
  }

  _copyCodeToClipboard() {
    const copyElement = document.createElement('textarea');
    copyElement.value = this.code;
    copyElement.setAttribute('readonly', '');
    copyElement.style = {
      position: 'absolute',
      left: '-9999px',
    };
    document.body.appendChild(copyElement);
    copyElement.select();
    document.execCommand('copy');
    document.body.removeChild(copyElement);
  }

  render() {
    return html`
      <div class="code-container">
        <div class="code-snippet">
          <pre><code class="language-${this.language}"></code></pre>
        </div>
        <eui-tooltip action position="left" message="Copy">
          <eui-icon name="copy" @click="${() => this._copyCodeToClipboard()}"></eui-icon>
        </eui-tooltip>
      </div>
    `;
  }
}

definition('e-code-snippet', {
  style,
  props: {
    componentName: {
      type: String,
      attribute: false,
      default: '',
    },
  },
})(CodeSnippet);

export default CodeSnippet;
