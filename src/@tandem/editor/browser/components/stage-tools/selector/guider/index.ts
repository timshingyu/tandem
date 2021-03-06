import { IPoint, Point, BoundingRect } from "@tandem/common/geom";

export class BoundingRectPoint implements IPoint {
  constructor(readonly rect: BoundingRect, readonly anchor: IPoint) {

  }

  get left() {
    return this.rect.left + this.rect.width * this.anchor.left;
  }

  get top() {
    return this.rect.top + this.rect.height * this.anchor.top;
  }
}

export function createBoundingRectPoints(rect: BoundingRect): Array<IPoint> {
  return [
    new BoundingRectPoint(rect, new Point(0, 0)),
    new BoundingRectPoint(rect, new Point(0.5, 0.5)),
    new BoundingRectPoint(rect, new Point(1, 1))
  ];
}


export class GuideLine {
  constructor(readonly origin: IPoint, readonly value: number, readonly horizontal: boolean) {

  }
}
export class BoundingRectSnapper {
  private _rect: BoundingRect;
  constructor(readonly guider: Guider) {
    this._rect = new BoundingRect(0, 0, 0, 0);
  }
}

export class Guider {
  public points: Array<IPoint>;

  constructor(public padding: number = 10) {
    this.points = [];
  }

  addPoint(...points: Array<IPoint>): void {
    this.points.push(...points);
  }

  getGuideLines(relativePoints: Array<IPoint> = []): Array<GuideLine> {
    const guideLines = [];

    for (const guidePoint of this.points) {
      for (const relativePoint of relativePoints) {
        if (Math.floor(guidePoint.top) === Math.floor(relativePoint.top)) {
          guideLines.push(new GuideLine(guidePoint, guidePoint.top, true));
          guideLines.push(new GuideLine(relativePoint, relativePoint.top, true));
        }
        if (Math.floor(guidePoint.left) === Math.floor(relativePoint.left)) {
          guideLines.push(new GuideLine(guidePoint, guidePoint.left, false));
          guideLines.push(new GuideLine(relativePoint, relativePoint.left, false));
        }
      }
    }

    return guideLines;
  }


  snap(point: IPoint, relativePoints: Array<IPoint> = []): IPoint {

    if (relativePoints.length === 0) relativePoints = [point];

    const guidePoints = [];

    let deltaLeft = 0;
    let deltaTop  = 0;
    let guideLeft = point.left;
    let guideTop  = point.top;

    for (const relativePoint of relativePoints) {

      const origLeft = relativePoint.left;
      const origTop  = relativePoint.top;

      let left = origLeft;
      let top  = origTop;

      for (const guidePoint of this.points) {
        if (left === origLeft) {
          left = this._snap(guidePoint.left, left);
        }
        if (top  === origTop) {
          top  = this._snap(guidePoint.top, top);
        }
      }

      if (deltaLeft === 0) {
        guideLeft = left;
        deltaLeft = left - origLeft;
      }
      if (deltaTop === 0) {
        deltaTop  = top - origTop;
        guideTop = top;
      }

      if (deltaLeft !== 0 && deltaTop !== 0) {
        break;
      }
    }

    return new Point(deltaLeft, deltaTop);
  }

  _snap(a: number, b: number) {
    if (this._overlaps(a, b)) {
      return a;
    }
    return b;
  }

  _overlaps(a: number, b: number) {
    return b >= (a - this.padding) && b <= (a + this.padding);
  }
}