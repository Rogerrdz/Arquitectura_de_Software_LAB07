package edu.eci.arsw.blueprints.filters;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BlueprintsFilterTest {

    @Test
    void testIdentityFilter() {
        IdentityFilter filter = new IdentityFilter();
        Blueprint original = new Blueprint("author", "name", 
                List.of(new Point(1, 1), new Point(2, 2)));
        
        Blueprint filtered = filter.apply(original);
        
        assertEquals(original.getAuthor(), filtered.getAuthor());
        assertEquals(original.getName(), filtered.getName());
        assertEquals(2, filtered.getPoints().size());
    }

    @Test
    void testRedundancyFilter_RemovesDuplicates() {
        RedundancyFilter filter = new RedundancyFilter();
        Blueprint original = new Blueprint("author", "name", 
                List.of(
                        new Point(1, 1),
                        new Point(1, 1), // duplicate
                        new Point(2, 2),
                        new Point(2, 2), // duplicate
                        new Point(3, 3)
                ));
        
        Blueprint filtered = filter.apply(original);
        
        assertEquals(3, filtered.getPoints().size());
        assertEquals(new Point(1, 1), filtered.getPoints().get(0));
        assertEquals(new Point(2, 2), filtered.getPoints().get(1));
        assertEquals(new Point(3, 3), filtered.getPoints().get(2));
    }

    @Test
    void testRedundancyFilter_EmptyBlueprint() {
        RedundancyFilter filter = new RedundancyFilter();
        Blueprint original = new Blueprint("author", "name", List.of());
        
        Blueprint filtered = filter.apply(original);
        
        assertTrue(filtered.getPoints().isEmpty());
    }

    @Test
    void testUndersamplingFilter_KeepsEvenIndices() {
        UndersamplingFilter filter = new UndersamplingFilter();
        Blueprint original = new Blueprint("author", "name", 
                List.of(
                        new Point(0, 0), // index 0 - keep
                        new Point(1, 1), // index 1 - remove
                        new Point(2, 2), // index 2 - keep
                        new Point(3, 3), // index 3 - remove
                        new Point(4, 4)  // index 4 - keep
                ));
        
        Blueprint filtered = filter.apply(original);
        
        assertEquals(3, filtered.getPoints().size());
        assertEquals(new Point(0, 0), filtered.getPoints().get(0));
        assertEquals(new Point(2, 2), filtered.getPoints().get(1));
        assertEquals(new Point(4, 4), filtered.getPoints().get(2));
    }

    @Test
    void testUndersamplingFilter_SmallBlueprint() {
        UndersamplingFilter filter = new UndersamplingFilter();
        Blueprint original = new Blueprint("author", "name", 
                List.of(new Point(1, 1), new Point(2, 2)));
        
        Blueprint filtered = filter.apply(original);
        
        // Should return original if size <= 2
        assertEquals(2, filtered.getPoints().size());
    }
}
