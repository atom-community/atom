/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TokenizedLine;
const Token = require('./token');
const CommentScopeRegex = /(\b|\.)comment/;

let idCounter = 1;

module.exports =
(TokenizedLine = (function() {
  TokenizedLine = class TokenizedLine {
    static initClass() {
  
      Object.defineProperty(this.prototype, 'tokens', { get() {
        if (this.cachedTokens) {
          return this.cachedTokens;
        } else {
          const iterator = this.getTokenIterator();
          const tokens = [];
  
          while (iterator.next()) {
            tokens.push(new Token({
              value: iterator.getText(),
              scopes: iterator.getScopes().slice()
            }));
          }
  
          return tokens;
        }
      }
    }
      );
    }
    constructor(properties) {
      let tokens;
      this.id = idCounter++;

      if (properties == null) { return; }

      ({openScopes: this.openScopes, text: this.text, tags: this.tags, ruleStack: this.ruleStack, tokenIterator: this.tokenIterator, grammar: this.grammar, tokens} = properties);
      this.cachedTokens = tokens;
    }

    getTokenIterator() { return this.tokenIterator.reset(this); }

    tokenAtBufferColumn(bufferColumn) {
      return this.tokens[this.tokenIndexAtBufferColumn(bufferColumn)];
    }

    tokenIndexAtBufferColumn(bufferColumn) {
      let index;
      let column = 0;
      for (index = 0; index < this.tokens.length; index++) {
        const token = this.tokens[index];
        column += token.value.length;
        if (column > bufferColumn) { return index; }
      }
      return index - 1;
    }

    tokenStartColumnForBufferColumn(bufferColumn) {
      let delta = 0;
      for (let token of Array.from(this.tokens)) {
        const nextDelta = delta + token.bufferDelta;
        if (nextDelta > bufferColumn) { break; }
        delta = nextDelta;
      }
      return delta;
    }

    isComment() {
      let tag;
      if (this.isCommentLine != null) { return this.isCommentLine; }

      this.isCommentLine = false;

      for (tag of Array.from(this.openScopes)) {
        if (this.isCommentOpenTag(tag)) {
          this.isCommentLine = true;
          return this.isCommentLine;
        }
      }

      let startIndex = 0;
      for (tag of Array.from(this.tags)) {
        // If we haven't encountered any comment scope when reading the first
        // non-whitespace chunk of text, then we consider this as not being a
        // comment line.
        if (tag > 0) {
          if (!isWhitespaceOnly(this.text.substr(startIndex, tag))) { break; }
          startIndex += tag;
        }

        if (this.isCommentOpenTag(tag)) {
          this.isCommentLine = true;
          return this.isCommentLine;
        }
      }

      return this.isCommentLine;
    }

    isCommentOpenTag(tag) {
      if ((tag < 0) && ((tag & 1) === 1)) {
        const scope = this.grammar.scopeForId(tag);
        if (CommentScopeRegex.test(scope)) {
          return true;
        }
      }
      return false;
    }

    tokenAtIndex(index) {
      return this.tokens[index];
    }

    getTokenCount() {
      let count = 0;
      for (let tag of Array.from(this.tags)) { if (tag >= 0) { count++; } }
      return count;
    }
  };
  TokenizedLine.initClass();
  return TokenizedLine;
})());

var isWhitespaceOnly = function(text) {
  for (let char of Array.from(text)) {
    if ((char !== '\t') && (char !== ' ')) {
      return false;
    }
  }
  return true;
};
