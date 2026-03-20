package edu.eci.arsw.blueprints.dto;

import java.util.List;

import edu.eci.arsw.blueprints.model.Point;

public record RealtimeBlueprintUpdate(String author, String name, List<Point> points) {
}
