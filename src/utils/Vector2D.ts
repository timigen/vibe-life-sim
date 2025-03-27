export class Vector2D {
  constructor(
    public x: number,
    public y: number
  ) {}

  distanceTo(other: Vector2D): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  normalize(): Vector2D {
    const d = Math.hypot(this.x, this.y);
    if (d > 0) {
      this.x /= d;
      this.y /= d;
    }
    return this;
  }

  multiply(scalar: number): Vector2D {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
}
