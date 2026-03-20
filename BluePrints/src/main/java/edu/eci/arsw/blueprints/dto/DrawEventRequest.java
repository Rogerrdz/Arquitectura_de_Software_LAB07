package edu.eci.arsw.blueprints.dto;

import edu.eci.arsw.blueprints.model.Point;

public record DrawEventRequest(String author, String name, Point point) {
}
