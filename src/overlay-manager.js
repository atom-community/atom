/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let OverlayManager;
const ElementResizeDetector = require('element-resize-detector');
let elementResizeDetector = null;

module.exports =
(OverlayManager = class OverlayManager {
  constructor(presenter, container, views) {
    this.presenter = presenter;
    this.container = container;
    this.views = views;
    this.overlaysById = {};
  }

  render(state) {
    for (let decorationId in state.content.overlays) {
      const overlay = state.content.overlays[decorationId];
      if (this.shouldUpdateOverlay(decorationId, overlay)) {
        this.renderOverlay(state, decorationId, overlay);
      }
    }

    return (() => {
      const result = [];
      for (let id in this.overlaysById) {
        const {overlayNode} = this.overlaysById[id];
        if (!state.content.overlays.hasOwnProperty(id)) {
          delete this.overlaysById[id];
          overlayNode.remove();
          result.push(elementResizeDetector.uninstall(overlayNode));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  shouldUpdateOverlay(decorationId, overlay) {
    const cachedOverlay = this.overlaysById[decorationId];
    if (cachedOverlay == null) { return true; }
    return ((cachedOverlay.pixelPosition != null ? cachedOverlay.pixelPosition.top : undefined) !== (overlay.pixelPosition != null ? overlay.pixelPosition.top : undefined)) ||
      ((cachedOverlay.pixelPosition != null ? cachedOverlay.pixelPosition.left : undefined) !== (overlay.pixelPosition != null ? overlay.pixelPosition.left : undefined));
  }

  measureOverlay(decorationId, itemView) {
    let left;
    const contentMargin = (left = parseInt(getComputedStyle(itemView)['margin-left'])) != null ? left : 0;
    return this.presenter.setOverlayDimensions(decorationId, itemView.offsetWidth, itemView.offsetHeight, contentMargin);
  }

  renderOverlay(state, decorationId, {item, pixelPosition, class: klass}) {
    let overlayNode;
    const itemView = this.views.getView(item);
    let cachedOverlay = this.overlaysById[decorationId];
    if (!(overlayNode = cachedOverlay != null ? cachedOverlay.overlayNode : undefined)) {
      overlayNode = document.createElement('atom-overlay');
      if (klass != null) { overlayNode.classList.add(klass); }
      if (elementResizeDetector == null) { elementResizeDetector = ElementResizeDetector({strategy: 'scroll'}); }
      elementResizeDetector.listenTo(overlayNode, () => {
        if (overlayNode.parentElement != null) {
          return this.measureOverlay(decorationId, itemView);
        }
      });
      this.container.appendChild(overlayNode);
      this.overlaysById[decorationId] = (cachedOverlay = {overlayNode, itemView});
    }

    // The same node may be used in more than one overlay. This steals the node
    // back if it has been displayed in another overlay.
    if (!overlayNode.contains(itemView)) { overlayNode.appendChild(itemView); }

    cachedOverlay.pixelPosition = pixelPosition;
    overlayNode.style.top = pixelPosition.top + 'px';
    overlayNode.style.left = pixelPosition.left + 'px';

    return this.measureOverlay(decorationId, itemView);
  }
});
