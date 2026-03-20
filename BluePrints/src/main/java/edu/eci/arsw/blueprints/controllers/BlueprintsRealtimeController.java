package edu.eci.arsw.blueprints.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.blueprints.dto.DrawEventRequest;
import edu.eci.arsw.blueprints.dto.RealtimeBlueprintUpdate;
import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.services.BlueprintsServices;

@Controller
public class BlueprintsRealtimeController {

    private static final Logger LOGGER = LoggerFactory.getLogger(BlueprintsRealtimeController.class);

    private final BlueprintsServices services;
    private final SimpMessagingTemplate messagingTemplate;

    public BlueprintsRealtimeController(BlueprintsServices services, SimpMessagingTemplate messagingTemplate) {
        this.services = services;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/draw")
    public void draw(DrawEventRequest request) {
        if (request == null || isBlank(request.author()) || isBlank(request.name()) || request.point() == null) {
            return;
        }

        try {
            services.addPoint(request.author(), request.name(), request.point().getX(), request.point().getY());
            Blueprint blueprint = services.getBlueprint(request.author(), request.name());

            messagingTemplate.convertAndSend(
                    topicFor(blueprint.getAuthor(), blueprint.getName()),
                    new RealtimeBlueprintUpdate(blueprint.getAuthor(), blueprint.getName(), blueprint.getPoints())
            );
        } catch (BlueprintNotFoundException ex) {
            LOGGER.warn("Realtime draw ignored for missing blueprint {}/{}", request.author(), request.name());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String topicFor(String author, String name) {
        return "/topic/blueprints." + author + "." + name;
    }
}
