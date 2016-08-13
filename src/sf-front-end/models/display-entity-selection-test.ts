import { expect } from "chai";
import { Element } from "sf-core/markup";
import { BoundingRect, IPosition } from "sf-core/geom";
import { DisplayEntitySelection } from "./display-entity-selection";
import { IEntityDisplay, IVisibleEntity, DisplayCapabilities } from "sf-core/entities";

describe(__filename + "#", () => {

  class MockDisplay implements IEntityDisplay {
    constructor(
      public bounds: BoundingRect,
      readonly capabilities: DisplayCapabilities = new DisplayCapabilities(true, true)
    ) {
    }

    get position() {
      const bounds = this.bounds;
      return { left: bounds.left, top: bounds.top };
    }

    set position({ left, top }: IPosition) {
      this.bounds = new BoundingRect(left, top, left + this.bounds.width, top + this.bounds.height);
    }
  }

  class VisibleEntity extends Element implements IVisibleEntity {
    readonly type: string = "display";
    readonly source: any = null;
    constructor(readonly display: IEntityDisplay) {
      super("entity");
    }
    dispose() { }
  }

  it("can be created", () => {
    new DisplayEntitySelection();
  });

  function _simplifyBounds(bounds: BoundingRect) {
    return [bounds.left, bounds.top, bounds.right, bounds.bottom];
  }

  it("computes the entire bounds of one entity", () => {
    const selection = new DisplayEntitySelection(
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400)))
    );
    expect(_simplifyBounds(selection.display.bounds)).to.eql([100, 200, 300, 400]);
  });

  it("calculates the outer bounds for multiple entities in the collection", () => {
    const selection = new DisplayEntitySelection(
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400))),
      new VisibleEntity(new MockDisplay(new BoundingRect(500, 600, 700, 800))),
      new VisibleEntity(new MockDisplay(new BoundingRect(900, 1000, 1100, 1200)))
    );
    expect(_simplifyBounds(selection.display.bounds)).to.eql([100, 200, 1100, 1200]);
  });

  it("returns the correct display capabilities for a single entity", () => {
    const selection = new DisplayEntitySelection(
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400), new DisplayCapabilities(true, true)))
    );
    expect(selection.display.capabilities.movable).to.equal(true);
    expect(selection.display.capabilities.resizable).to.equal(true);
  });

  it("returns the correct display capabilities for multiple entities", () => {
    const selection = new DisplayEntitySelection(
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400), new DisplayCapabilities(true, true))),
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400), new DisplayCapabilities(false, true)))
    );
    expect(selection.display.capabilities.movable).to.equal(false);
    expect(selection.display.capabilities.resizable).to.equal(true);

    selection.push(new VisibleEntity(new MockDisplay(new BoundingRect(100, 200, 300, 400), new DisplayCapabilities(false, false))));

    expect(selection.display.capabilities.resizable).to.equal(false);
  });

  it("can change the bounds for multiple entities", () => {
    const selection = new DisplayEntitySelection(
      new VisibleEntity(new MockDisplay(new BoundingRect(0, 0, 100, 100))),
      new VisibleEntity(new MockDisplay(new BoundingRect(100, 100, 200, 200)))
    );

    selection.display.bounds = new BoundingRect(200, 200, 300, 300);

    expect(_simplifyBounds(selection[0].display.bounds)).to.eql([200, 200, 250, 250]);
    expect(_simplifyBounds(selection[1].display.bounds)).to.eql([250, 250, 300, 300]);
  });
});