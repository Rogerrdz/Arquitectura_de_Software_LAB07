package edu.eci.arsw.blueprints.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BlueprintsAPIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetAllBlueprints() throws Exception {
        mockMvc.perform(get("/api/v1/blueprints"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", not(empty())));
    }

    @Test
    void testGetBlueprintsByAuthor() throws Exception {
        mockMvc.perform(get("/api/v1/blueprints/john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testGetBlueprintsByAuthor_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/blueprints/nonexistent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void testGetSpecificBlueprint() throws Exception {
        mockMvc.perform(get("/api/v1/blueprints/john/house"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.author").value("john"))
                .andExpect(jsonPath("$.data.name").value("house"))
                .andExpect(jsonPath("$.data.points").isArray());
    }

    @Test
    void testGetSpecificBlueprint_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/blueprints/john/nonexistent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void testCreateBlueprint() throws Exception {
        String newBlueprintJson = """
                {
                    "author": "testauthor",
                    "name": "testprint",
                    "points": [
                        {"x": 1, "y": 1},
                        {"x": 2, "y": 2}
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/blueprints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newBlueprintJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Created successfully"))
                .andExpect(jsonPath("$.data.author").value("testauthor"))
                .andExpect(jsonPath("$.data.name").value("testprint"));
    }

    @Test
    void testCreateBlueprint_Duplicate() throws Exception {
        String duplicateBlueprintJson = """
                {
                    "author": "john",
                    "name": "house",
                    "points": [
                        {"x": 1, "y": 1}
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/blueprints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateBlueprintJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409));
    }

    @Test
    void testCreateBlueprint_InvalidData() throws Exception {
        String invalidBlueprintJson = """
                {
                    "author": "",
                    "name": "",
                    "points": []
                }
                """;

        mockMvc.perform(post("/api/v1/blueprints")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBlueprintJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void testAddPointToBlueprint() throws Exception {
        String pointJson = """
                {
                    "x": 100,
                    "y": 200
                }
                """;

        mockMvc.perform(put("/api/v1/blueprints/john/house/points")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pointJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.code").value(202))
                .andExpect(jsonPath("$.message").value("Accepted"));
    }

    @Test
    void testAddPointToBlueprint_NotFound() throws Exception {
        String pointJson = """
                {
                    "x": 100,
                    "y": 200
                }
                """;

        mockMvc.perform(put("/api/v1/blueprints/john/nonexistent/points")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pointJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }
}
