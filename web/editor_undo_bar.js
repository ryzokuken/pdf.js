/* Copyright 2024 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class EditorUndoBar {
  #container;

  #controller = null;

  isOpen = false;

  #l10n;

  #message;

  #undoButton;

  static #l10nMessages = Object.freeze({
    highlight: "pdfjs-editor-undo-bar-message-highlight",
    freetext: "pdfjs-editor-undo-bar-message-freetext",
    stamp: "pdfjs-editor-undo-bar-message-stamp",
    ink: "pdfjs-editor-undo-bar-message-ink",
    __multiple: "pdfjs-editor-undo-bar-message-multiple",
  });

  constructor({ container, message, undoButton, closeButton }, eventBus, l10n) {
    this.#container = container;
    this.#message = message;
    this.#undoButton = undoButton;
    this.#l10n = l10n;

    // Caveat: we have to pick between registering these everytime the bar is
    // shown and not having the ability to cleanup using AbortController.
    const boundHide = this.hide.bind(this);
    closeButton.addEventListener("click", boundHide);
    eventBus._on("beforeprint", boundHide);
    eventBus._on("download", boundHide);
  }

  async show(undoAction, messageData) {
    this.hide();
    this.isOpen = true;
    this.#controller = new AbortController();

    this.#message.textContent =
      typeof messageData === "string"
        ? await this.#l10n.get(EditorUndoBar.#l10nMessages[messageData])
        : await this.#l10n.get(EditorUndoBar.#l10nMessages.__multiple, {
            count: messageData,
          });
    this.#container.hidden = false;

    this.#undoButton.addEventListener(
      "click",
      () => {
        undoAction();
        this.hide();
      },
      { signal: this.#controller.signal }
    );
    this.#undoButton.focus();
  }

  hide() {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.#container.hidden = true;
    this.#controller?.abort();
    this.#controller = null;
  }
}

export { EditorUndoBar };
