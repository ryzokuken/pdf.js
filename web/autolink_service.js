export class AutolinkService {
  constructor(eventBus) {
    eventBus._on("textlayerrendered", ({ source }) => {
      source.processLinks();
    });
  }
}
