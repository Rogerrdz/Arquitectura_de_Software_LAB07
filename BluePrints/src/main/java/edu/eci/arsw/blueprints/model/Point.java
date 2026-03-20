package edu.eci.arsw.blueprints.model;

import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class Point {
    private int x;
    private int y;

    public Point() {}

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // JavaBeans-style getters for JSON serialization
    public int getX() { return x; }
    public int getY() { return y; }
    
    // Record-style accessors (for compatibility)
    public int x() { return x; }
    public int y() { return y; }

    public void setX(int x) { this.x = x; }
    public void setY(int y) { this.y = y; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point point)) return false;
        return x == point.x && y == point.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}
