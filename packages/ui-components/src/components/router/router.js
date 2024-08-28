class RouterWrapper {
  constructor() {
    this.routes = {};

    this.handleLocationChange = this.handleLocationChange.bind(this);

    document.addEventListener('location:change', this.handleLocationChange);
  }

  handleLocationChange(event) {
    const { appPath, query } = event.detail;
    const keys = Object.getOwnPropertySymbols(this.routes);
    keys.forEach((key) => this.routes[key](appPath, query));
  }

  get router() {
    // @ts-ignore
    const { Router } = window.EUI;
    return Router;
  }
}

export default RouterWrapper;
