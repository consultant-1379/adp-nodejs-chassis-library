class K8sServiceUtilMock {
  checkServiceProtocol() {
    return { httpsEnabled: true, httpEnabled: true };
  }

  waitUntilFound() {
    return { httpsEnabled: true, httpEnabled: true };
  }

  determineProtocol() {
    return 'https';
  }
}

export default K8sServiceUtilMock;
