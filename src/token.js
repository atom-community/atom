/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Token;
const _ = require('underscore-plus');

const StartDotRegex = /^\.?/;

// Represents a single unit of text as selected by a grammar.
module.exports =
(Token = (function() {
  Token = class Token {
    static initClass() {
      this.prototype.value = null;
      this.prototype.scopes = null;
    }

    constructor(properties) {
      ({value: this.value, scopes: this.scopes} = properties);
    }

    isEqual(other) {
      // TODO: scopes is deprecated. This is here for the sake of lang package tests
      return (this.value === other.value) && _.isEqual(this.scopes, other.scopes);
    }

    isBracket() {
      return /^meta\.brace\b/.test(_.last(this.scopes));
    }

    matchesScopeSelector(selector) {
      const targetClasses = selector.replace(StartDotRegex, '').split('.');
      return _.any(this.scopes, function(scope) {
        const scopeClasses = scope.split('.');
        return _.isSubset(targetClasses, scopeClasses);
      });
    }
  };
  Token.initClass();
  return Token;
})());
