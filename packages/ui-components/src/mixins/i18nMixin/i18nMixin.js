const i18nMixin = (defaultI18n, Type) =>
  class extends Type {
    get i18n() {
      return this._i18n ?? defaultI18n ?? {};
    }

    set i18n(i18n) {
      this._i18n = i18n;
    }
  };

export default i18nMixin;
