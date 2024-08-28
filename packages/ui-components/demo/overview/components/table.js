import { definition, LitComponent, html } from '@eui/lit-component';
import style from './table.css';

export default class Table extends LitComponent {
  didConnect() {
    const headerKeys = Object.keys(this.columns);
    this.header = this._getHeader(headerKeys);
    this.body = this._getBody(headerKeys);
  }

  _getHeader(headerKeys) {
    const headCells = headerKeys.map(
      (headerKey) => html`
        <th>${this.columns[headerKey]}</th>
      `,
    );

    return html`
      <thead>
        <tr>${headCells}</tr>
      </thead>
    `;
  }

  _getBody(headerKeys) {
    const rowCells = (row) =>
      headerKeys.map(
        (headerKey) => html`
          <td>${row[headerKey]}</td>
        `,
      );
    const body = this.rows.map(
      (row) => html`
        <tr>${rowCells(row)}</tr>
      `,
    );

    return html`
      <tbody>${body}</tbody>
    `;
  }

  render() {
    return html`
      <table>${this.header} ${this.body}</table>
    `;
  }
}

definition('e-table', {
  style,
  props: {
    columns: {
      type: Object,
      attribute: false,
    },
    rows: {
      type: Array,
      attribute: false,
    },
  },
})(Table);
