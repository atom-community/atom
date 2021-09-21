/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Model;
let nextInstanceId = 1;

module.exports =
(Model = (function() {
  Model = class Model {
    static initClass() {
  
      this.prototype.alive = true;
    }
    static resetNextInstanceId() { return nextInstanceId = 1; }

    constructor(params) {
      this.assignId(params != null ? params.id : undefined);
    }

    assignId(id) {
      if (this.id == null) { this.id = id != null ? id : nextInstanceId++; }
      if (id >= nextInstanceId) { return nextInstanceId = id + 1; }
    }

    destroy() {
      if (!this.isAlive()) { return; }
      this.alive = false;
      return (typeof this.destroyed === 'function' ? this.destroyed() : undefined);
    }

    isAlive() { return this.alive; }

    isDestroyed() { return !this.isAlive(); }
  };
  Model.initClass();
  return Model;
})());
