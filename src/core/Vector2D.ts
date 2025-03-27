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

  add(other: Vector2D): Vector2D {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector2D): Vector2D {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}
