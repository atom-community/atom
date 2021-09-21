/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { ipcRenderer } = require('electron');
const Grim = require('grim');

module.exports = function({
  commandRegistry,
  commandInstaller,
  config,
  notificationManager,
  project,
  clipboard
}) {
  commandRegistry.add(
    'atom-workspace',
    {
      'pane:show-next-recently-used-item'() {
        return this.getModel()
          .getActivePane()
          .activateNextRecentlyUsedItem();
      },
      'pane:show-previous-recently-used-item'() {
        return this.getModel()
          .getActivePane()
          .activatePreviousRecentlyUsedItem();
      },
      'pane:move-active-item-to-top-of-stack'() {
        return this.getModel()
          .getActivePane()
          .moveActiveItemToTopOfStack();
      },
      'pane:show-next-item'() {
        return this.getModel()
          .getActivePane()
          .activateNextItem();
      },
      'pane:show-previous-item'() {
        return this.getModel()
          .getActivePane()
          .activatePreviousItem();
      },
      'pane:show-item-1'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(0);
      },
      'pane:show-item-2'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(1);
      },
      'pane:show-item-3'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(2);
      },
      'pane:show-item-4'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(3);
      },
      'pane:show-item-5'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(4);
      },
      'pane:show-item-6'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(5);
      },
      'pane:show-item-7'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(6);
      },
      'pane:show-item-8'() {
        return this.getModel()
          .getActivePane()
          .activateItemAtIndex(7);
      },
      'pane:show-item-9'() {
        return this.getModel()
          .getActivePane()
          .activateLastItem();
      },
      'pane:move-item-right'() {
        return this.getModel()
          .getActivePane()
          .moveItemRight();
      },
      'pane:move-item-left'() {
        return this.getModel()
          .getActivePane()
          .moveItemLeft();
      },
      'window:increase-font-size'() {
        return this.getModel().increaseFontSize();
      },
      'window:decrease-font-size'() {
        return this.getModel().decreaseFontSize();
      },
      'window:reset-font-size'() {
        return this.getModel().resetFontSize();
      },
      'application:about'() {
        return ipcRenderer.send('command', 'application:about');
      },
      'application:show-preferences'() {
        return ipcRenderer.send('command', 'application:show-settings');
      },
      'application:show-settings'() {
        return ipcRenderer.send('command', 'application:show-settings');
      },
      'application:quit'() {
        return ipcRenderer.send('command', 'application:quit');
      },
      'application:hide'() {
        return ipcRenderer.send('command', 'application:hide');
      },
      'application:hide-other-applications'() {
        return ipcRenderer.send(
          'command',
          'application:hide-other-applications'
        );
      },
      'application:install-update'() {
        return ipcRenderer.send('command', 'application:install-update');
      },
      'application:unhide-all-applications'() {
        return ipcRenderer.send(
          'command',
          'application:unhide-all-applications'
        );
      },
      'application:new-window'() {
        return ipcRenderer.send('command', 'application:new-window');
      },
      'application:new-file'() {
        return ipcRenderer.send('command', 'application:new-file');
      },
      'application:open'() {
        let left;
        const defaultPath =
          (left = __guard__(atom.workspace.getActiveTextEditor(), x =>
            x.getPath()
          )) != null
            ? left
            : __guard__(atom.project.getPaths(), x1 => x1[0]);
        return ipcRenderer.send('open-chosen-any', defaultPath);
      },
      'application:open-file'() {
        let left;
        const defaultPath =
          (left = __guard__(atom.workspace.getActiveTextEditor(), x =>
            x.getPath()
          )) != null
            ? left
            : __guard__(atom.project.getPaths(), x1 => x1[0]);
        return ipcRenderer.send('open-chosen-file', defaultPath);
      },
      'application:open-folder'() {
        let left;
        const defaultPath =
          (left = __guard__(atom.workspace.getActiveTextEditor(), x =>
            x.getPath()
          )) != null
            ? left
            : __guard__(atom.project.getPaths(), x1 => x1[0]);
        return ipcRenderer.send('open-chosen-folder', defaultPath);
      },
      'application:open-dev'() {
        return ipcRenderer.send('command', 'application:open-dev');
      },
      'application:open-safe'() {
        return ipcRenderer.send('command', 'application:open-safe');
      },
      'application:add-project-folder'() {
        return atom.addProjectFolder();
      },
      'application:minimize'() {
        return ipcRenderer.send('command', 'application:minimize');
      },
      'application:zoom'() {
        return ipcRenderer.send('command', 'application:zoom');
      },
      'application:bring-all-windows-to-front'() {
        return ipcRenderer.send(
          'command',
          'application:bring-all-windows-to-front'
        );
      },
      'application:open-your-config'() {
        return ipcRenderer.send('command', 'application:open-your-config');
      },
      'application:open-your-init-script'() {
        return ipcRenderer.send('command', 'application:open-your-init-script');
      },
      'application:open-your-keymap'() {
        return ipcRenderer.send('command', 'application:open-your-keymap');
      },
      'application:open-your-snippets'() {
        return ipcRenderer.send('command', 'application:open-your-snippets');
      },
      'application:open-your-stylesheet'() {
        return ipcRenderer.send('command', 'application:open-your-stylesheet');
      },
      'application:open-license'() {
        return this.getModel().openLicense();
      },
      'window:run-package-specs'() {
        return this.runPackageSpecs();
      },
      'window:run-benchmarks'() {
        return this.runBenchmarks();
      },
      'window:toggle-left-dock'() {
        return this.getModel()
          .getLeftDock()
          .toggle();
      },
      'window:toggle-right-dock'() {
        return this.getModel()
          .getRightDock()
          .toggle();
      },
      'window:toggle-bottom-dock'() {
        return this.getModel()
          .getBottomDock()
          .toggle();
      },
      'window:focus-next-pane'() {
        return this.getModel().activateNextPane();
      },
      'window:focus-previous-pane'() {
        return this.getModel().activatePreviousPane();
      },
      'window:focus-pane-above'() {
        return this.focusPaneViewAbove();
      },
      'window:focus-pane-below'() {
        return this.focusPaneViewBelow();
      },
      'window:focus-pane-on-left'() {
        return this.focusPaneViewOnLeft();
      },
      'window:focus-pane-on-right'() {
        return this.focusPaneViewOnRight();
      },
      'window:move-active-item-to-pane-above'() {
        return this.moveActiveItemToPaneAbove();
      },
      'window:move-active-item-to-pane-below'() {
        return this.moveActiveItemToPaneBelow();
      },
      'window:move-active-item-to-pane-on-left'() {
        return this.moveActiveItemToPaneOnLeft();
      },
      'window:move-active-item-to-pane-on-right'() {
        return this.moveActiveItemToPaneOnRight();
      },
      'window:copy-active-item-to-pane-above'() {
        return this.moveActiveItemToPaneAbove({ keepOriginal: true });
      },
      'window:copy-active-item-to-pane-below'() {
        return this.moveActiveItemToPaneBelow({ keepOriginal: true });
      },
      'window:copy-active-item-to-pane-on-left'() {
        return this.moveActiveItemToPaneOnLeft({ keepOriginal: true });
      },
      'window:copy-active-item-to-pane-on-right'() {
        return this.moveActiveItemToPaneOnRight({ keepOriginal: true });
      },
      'window:save-all'() {
        return this.getModel().saveAll();
      },
      'window:toggle-invisibles'() {
        return config.set(
          'editor.showInvisibles',
          !config.get('editor.showInvisibles')
        );
      },
      'window:log-deprecation-warnings'() {
        return Grim.logDeprecations();
      },
      'window:toggle-auto-indent'() {
        return config.set(
          'editor.autoIndent',
          !config.get('editor.autoIndent')
        );
      },
      'pane:reopen-closed-item'() {
        return this.getModel().reopenItem();
      },
      'core:close'() {
        return this.getModel().closeActivePaneItemOrEmptyPaneOrWindow();
      },
      'core:save'() {
        return this.getModel().saveActivePaneItem();
      },
      'core:save-as'() {
        return this.getModel().saveActivePaneItemAs();
      }
    },
    false
  );

  if (process.platform === 'darwin') {
    commandRegistry.add(
      'atom-workspace',
      'window:install-shell-commands',
      () => commandInstaller.installShellCommandsInteractively(),
      false
    );
  }

  commandRegistry.add(
    'atom-pane',
    {
      'pane:save-items'() {
        return this.getModel().saveItems();
      },
      'pane:split-left'() {
        return this.getModel().splitLeft();
      },
      'pane:split-right'() {
        return this.getModel().splitRight();
      },
      'pane:split-up'() {
        return this.getModel().splitUp();
      },
      'pane:split-down'() {
        return this.getModel().splitDown();
      },
      'pane:split-left-and-copy-active-item'() {
        return this.getModel().splitLeft({ copyActiveItem: true });
      },
      'pane:split-right-and-copy-active-item'() {
        return this.getModel().splitRight({ copyActiveItem: true });
      },
      'pane:split-up-and-copy-active-item'() {
        return this.getModel().splitUp({ copyActiveItem: true });
      },
      'pane:split-down-and-copy-active-item'() {
        return this.getModel().splitDown({ copyActiveItem: true });
      },
      'pane:split-left-and-move-active-item'() {
        return this.getModel().splitLeft({ moveActiveItem: true });
      },
      'pane:split-right-and-move-active-item'() {
        return this.getModel().splitRight({ moveActiveItem: true });
      },
      'pane:split-up-and-move-active-item'() {
        return this.getModel().splitUp({ moveActiveItem: true });
      },
      'pane:split-down-and-move-active-item'() {
        return this.getModel().splitDown({ moveActiveItem: true });
      },
      'pane:close'() {
        return this.getModel().close();
      },
      'pane:close-other-items'() {
        return this.getModel().destroyInactiveItems();
      },
      'pane:increase-size'() {
        return this.getModel().increaseSize();
      },
      'pane:decrease-size'() {
        return this.getModel().decreaseSize();
      }
    },
    false
  );

  commandRegistry.add(
    'atom-text-editor',
    stopEventPropagation({
      'core:move-left'() {
        return this.moveLeft();
      },
      'core:move-right'() {
        return this.moveRight();
      },
      'core:select-left'() {
        return this.selectLeft();
      },
      'core:select-right'() {
        return this.selectRight();
      },
      'core:select-up'() {
        return this.selectUp();
      },
      'core:select-down'() {
        return this.selectDown();
      },
      'core:select-all'() {
        return this.selectAll();
      },
      'editor:select-word'() {
        return this.selectWordsContainingCursors();
      },
      'editor:consolidate-selections'(event) {
        if (!this.consolidateSelections()) {
          return event.abortKeyBinding();
        }
      },
      'editor:move-to-beginning-of-next-paragraph'() {
        return this.moveToBeginningOfNextParagraph();
      },
      'editor:move-to-beginning-of-previous-paragraph'() {
        return this.moveToBeginningOfPreviousParagraph();
      },
      'editor:move-to-beginning-of-screen-line'() {
        return this.moveToBeginningOfScreenLine();
      },
      'editor:move-to-beginning-of-line'() {
        return this.moveToBeginningOfLine();
      },
      'editor:move-to-end-of-screen-line'() {
        return this.moveToEndOfScreenLine();
      },
      'editor:move-to-end-of-line'() {
        return this.moveToEndOfLine();
      },
      'editor:move-to-first-character-of-line'() {
        return this.moveToFirstCharacterOfLine();
      },
      'editor:move-to-beginning-of-word'() {
        return this.moveToBeginningOfWord();
      },
      'editor:move-to-end-of-word'() {
        return this.moveToEndOfWord();
      },
      'editor:move-to-beginning-of-next-word'() {
        return this.moveToBeginningOfNextWord();
      },
      'editor:move-to-previous-word-boundary'() {
        return this.moveToPreviousWordBoundary();
      },
      'editor:move-to-next-word-boundary'() {
        return this.moveToNextWordBoundary();
      },
      'editor:move-to-previous-subword-boundary'() {
        return this.moveToPreviousSubwordBoundary();
      },
      'editor:move-to-next-subword-boundary'() {
        return this.moveToNextSubwordBoundary();
      },
      'editor:select-to-beginning-of-next-paragraph'() {
        return this.selectToBeginningOfNextParagraph();
      },
      'editor:select-to-beginning-of-previous-paragraph'() {
        return this.selectToBeginningOfPreviousParagraph();
      },
      'editor:select-to-end-of-line'() {
        return this.selectToEndOfLine();
      },
      'editor:select-to-beginning-of-line'() {
        return this.selectToBeginningOfLine();
      },
      'editor:select-to-end-of-word'() {
        return this.selectToEndOfWord();
      },
      'editor:select-to-beginning-of-word'() {
        return this.selectToBeginningOfWord();
      },
      'editor:select-to-beginning-of-next-word'() {
        return this.selectToBeginningOfNextWord();
      },
      'editor:select-to-next-word-boundary'() {
        return this.selectToNextWordBoundary();
      },
      'editor:select-to-previous-word-boundary'() {
        return this.selectToPreviousWordBoundary();
      },
      'editor:select-to-next-subword-boundary'() {
        return this.selectToNextSubwordBoundary();
      },
      'editor:select-to-previous-subword-boundary'() {
        return this.selectToPreviousSubwordBoundary();
      },
      'editor:select-to-first-character-of-line'() {
        return this.selectToFirstCharacterOfLine();
      },
      'editor:select-line'() {
        return this.selectLinesContainingCursors();
      },
      'editor:select-larger-syntax-node'() {
        return this.selectLargerSyntaxNode();
      },
      'editor:select-smaller-syntax-node'() {
        return this.selectSmallerSyntaxNode();
      }
    }),
    false
  );

  commandRegistry.add(
    'atom-text-editor:not([readonly])',
    stopEventPropagation({
      'core:undo'() {
        return this.undo();
      },
      'core:redo'() {
        return this.redo();
      }
    }),
    false
  );

  commandRegistry.add(
    'atom-text-editor',
    stopEventPropagationAndGroupUndo(config, {
      'core:copy'() {
        return this.copySelectedText();
      },
      'editor:copy-selection'() {
        return this.copyOnlySelectedText();
      }
    }),
    false
  );

  commandRegistry.add(
    'atom-text-editor:not([readonly])',
    stopEventPropagationAndGroupUndo(config, {
      'core:backspace'() {
        return this.backspace();
      },
      'core:delete'() {
        return this.delete();
      },
      'core:cut'() {
        return this.cutSelectedText();
      },
      'core:paste'() {
        return this.pasteText();
      },
      'editor:paste-without-reformatting'() {
        return this.pasteText({
          normalizeLineEndings: false,
          autoIndent: false,
          preserveTrailingLineIndentation: true
        });
      },
      'editor:delete-to-previous-word-boundary'() {
        return this.deleteToPreviousWordBoundary();
      },
      'editor:delete-to-next-word-boundary'() {
        return this.deleteToNextWordBoundary();
      },
      'editor:delete-to-beginning-of-word'() {
        return this.deleteToBeginningOfWord();
      },
      'editor:delete-to-beginning-of-line'() {
        return this.deleteToBeginningOfLine();
      },
      'editor:delete-to-end-of-line'() {
        return this.deleteToEndOfLine();
      },
      'editor:delete-to-end-of-word'() {
        return this.deleteToEndOfWord();
      },
      'editor:delete-to-beginning-of-subword'() {
        return this.deleteToBeginningOfSubword();
      },
      'editor:delete-to-end-of-subword'() {
        return this.deleteToEndOfSubword();
      },
      'editor:delete-line'() {
        return this.deleteLine();
      },
      'editor:cut-to-end-of-line'() {
        return this.cutToEndOfLine();
      },
      'editor:cut-to-end-of-buffer-line'() {
        return this.cutToEndOfBufferLine();
      },
      'editor:transpose'() {
        return this.transpose();
      },
      'editor:upper-case'() {
        return this.upperCase();
      },
      'editor:lower-case'() {
        return this.lowerCase();
      }
    }),
    false
  );

  commandRegistry.add(
    'atom-text-editor:not([mini])',
    stopEventPropagation({
      'core:move-up'() {
        return this.moveUp();
      },
      'core:move-down'() {
        return this.moveDown();
      },
      'core:move-to-top'() {
        return this.moveToTop();
      },
      'core:move-to-bottom'() {
        return this.moveToBottom();
      },
      'core:page-up'() {
        return this.pageUp();
      },
      'core:page-down'() {
        return this.pageDown();
      },
      'core:select-to-top'() {
        return this.selectToTop();
      },
      'core:select-to-bottom'() {
        return this.selectToBottom();
      },
      'core:select-page-up'() {
        return this.selectPageUp();
      },
      'core:select-page-down'() {
        return this.selectPageDown();
      },
      'editor:add-selection-below'() {
        return this.addSelectionBelow();
      },
      'editor:add-selection-above'() {
        return this.addSelectionAbove();
      },
      'editor:split-selections-into-lines'() {
        return this.splitSelectionsIntoLines();
      },
      'editor:toggle-soft-tabs'() {
        return this.toggleSoftTabs();
      },
      'editor:toggle-soft-wrap'() {
        return this.toggleSoftWrapped();
      },
      'editor:fold-all'() {
        return this.foldAll();
      },
      'editor:unfold-all'() {
        return this.unfoldAll();
      },
      'editor:fold-current-row'() {
        this.foldCurrentRow();
        return this.scrollToCursorPosition();
      },
      'editor:unfold-current-row'() {
        this.unfoldCurrentRow();
        return this.scrollToCursorPosition();
      },
      'editor:fold-selection'() {
        return this.foldSelectedLines();
      },
      'editor:fold-at-indent-level-1'() {
        this.foldAllAtIndentLevel(0);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-2'() {
        this.foldAllAtIndentLevel(1);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-3'() {
        this.foldAllAtIndentLevel(2);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-4'() {
        this.foldAllAtIndentLevel(3);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-5'() {
        this.foldAllAtIndentLevel(4);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-6'() {
        this.foldAllAtIndentLevel(5);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-7'() {
        this.foldAllAtIndentLevel(6);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-8'() {
        this.foldAllAtIndentLevel(7);
        return this.scrollToCursorPosition();
      },
      'editor:fold-at-indent-level-9'() {
        this.foldAllAtIndentLevel(8);
        return this.scrollToCursorPosition();
      },
      'editor:log-cursor-scope'() {
        return showCursorScope(this.getCursorScope(), notificationManager);
      },
      'editor:log-cursor-syntax-tree-scope'() {
        return showSyntaxTree(
          this.getCursorSyntaxTreeScope(),
          notificationManager
        );
      },
      'editor:copy-path'() {
        return copyPathToClipboard(this, project, clipboard, false);
      },
      'editor:copy-project-path'() {
        return copyPathToClipboard(this, project, clipboard, true);
      },
      'editor:toggle-indent-guide'() {
        return config.set(
          'editor.showIndentGuide',
          !config.get('editor.showIndentGuide')
        );
      },
      'editor:toggle-line-numbers'() {
        return config.set(
          'editor.showLineNumbers',
          !config.get('editor.showLineNumbers')
        );
      },
      'editor:scroll-to-cursor'() {
        return this.scrollToCursorPosition();
      }
    }),
    false
  );

  return commandRegistry.add(
    'atom-text-editor:not([mini]):not([readonly])',
    stopEventPropagationAndGroupUndo(config, {
      'editor:indent'() {
        return this.indent();
      },
      'editor:auto-indent'() {
        return this.autoIndentSelectedRows();
      },
      'editor:indent-selected-rows'() {
        return this.indentSelectedRows();
      },
      'editor:outdent-selected-rows'() {
        return this.outdentSelectedRows();
      },
      'editor:newline'() {
        return this.insertNewline();
      },
      'editor:newline-below'() {
        return this.insertNewlineBelow();
      },
      'editor:newline-above'() {
        return this.insertNewlineAbove();
      },
      'editor:toggle-line-comments'() {
        return this.toggleLineCommentsInSelection();
      },
      'editor:checkout-head-revision'() {
        return atom.workspace.checkoutHeadRevision(this);
      },
      'editor:move-line-up'() {
        return this.moveLineUp();
      },
      'editor:move-line-down'() {
        return this.moveLineDown();
      },
      'editor:move-selection-left'() {
        return this.moveSelectionLeft();
      },
      'editor:move-selection-right'() {
        return this.moveSelectionRight();
      },
      'editor:duplicate-lines'() {
        return this.duplicateLines();
      },
      'editor:join-lines'() {
        return this.joinLines();
      }
    }),
    false
  );
};

var stopEventPropagation = function(commandListeners) {
  const newCommandListeners = {};
  for (var commandName in commandListeners) {
    const commandListener = commandListeners[commandName];
    (commandListener =>
      (newCommandListeners[commandName] = function(event) {
        event.stopPropagation();
        return commandListener.call(this.getModel(), event);
      }))(commandListener);
  }
  return newCommandListeners;
};

var stopEventPropagationAndGroupUndo = function(config, commandListeners) {
  const newCommandListeners = {};
  for (var commandName in commandListeners) {
    const commandListener = commandListeners[commandName];
    (commandListener =>
      (newCommandListeners[commandName] = function(event) {
        event.stopPropagation();
        const model = this.getModel();
        return model.transact(model.getUndoGroupingInterval(), () =>
          commandListener.call(model, event)
        );
      }))(commandListener);
  }
  return newCommandListeners;
};

var showCursorScope = function(descriptor, notificationManager) {
  let list = descriptor.scopes.toString().split(',');
  list = list.map(item => `* ${item}`);
  const content = `Scopes at Cursor\n${list.join('\n')}`;

  return notificationManager.addInfo(content, { dismissable: true });
};

var showSyntaxTree = function(descriptor, notificationManager) {
  let list = descriptor.scopes.toString().split(',');
  list = list.map(item => `* ${item}`);
  const content = `Syntax tree at Cursor\n${list.join('\n')}`;

  return notificationManager.addInfo(content, { dismissable: true });
};

var copyPathToClipboard = function(editor, project, clipboard, relative) {
  let filePath;
  if ((filePath = editor.getPath())) {
    if (relative) {
      filePath = project.relativize(filePath);
    }
    return clipboard.write(filePath);
  }
};

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
