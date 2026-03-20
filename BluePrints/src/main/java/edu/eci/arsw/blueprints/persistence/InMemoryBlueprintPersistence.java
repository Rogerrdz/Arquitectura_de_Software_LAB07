package edu.eci.arsw.blueprints.persistence;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;

@Repository
@Profile("!postgres")
public class InMemoryBlueprintPersistence implements BlueprintPersistence {

    private final Map<String, Blueprint> blueprints = new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        // Sample data with visible coordinates (canvas is 520x360)
        Blueprint bp1 = new Blueprint("john", "house",
                List.of(new Point(50,50), new Point(250,50), new Point(250,200), new Point(50,200), new Point(50,50)));
        Blueprint bp2 = new Blueprint("john", "garage",
                List.of(new Point(100,80), new Point(300,80), new Point(300,180), new Point(100,180), new Point(100,80)));
        Blueprint bp3 = new Blueprint("jane", "garden",
                List.of(new Point(80,100), new Point(200,60), new Point(280,150), new Point(150,220), new Point(80,100)));
        blueprints.put(keyOf(bp1), bp1);
        blueprints.put(keyOf(bp2), bp2);
        blueprints.put(keyOf(bp3), bp3);
    }

    private String keyOf(Blueprint bp) { return bp.getAuthor() + ":" + bp.getName(); }
    private String keyOf(String author, String name) { return author + ":" + name; }

    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        String k = keyOf(bp);
        if (blueprints.containsKey(k)) throw new BlueprintPersistenceException("Blueprint already exists: " + k);
        blueprints.put(k, bp);
    }

    @Override
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint bp = blueprints.get(keyOf(author, name));
        if (bp == null) throw new BlueprintNotFoundException("Blueprint not found: %s/%s".formatted(author, name));
        return bp;
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> set = blueprints.values().stream()
                .filter(bp -> bp.getAuthor().equals(author))
                .collect(Collectors.toSet());
        if (set.isEmpty()) throw new BlueprintNotFoundException("No blueprints for author: " + author);
        return set;
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(blueprints.values());
    }

    @Override
    public void addPoint(String author, String name, int x, int y) throws BlueprintNotFoundException {
        Blueprint bp = getBlueprint(author, name);
        bp.addPoint(new Point(x, y));
    }

    @Override
    public void updateBlueprint(String author, String name, Blueprint bp) throws BlueprintNotFoundException {
        String key = author + ":" + name;
        if (!blueprints.containsKey(key)) {
            throw new BlueprintNotFoundException("Blueprint " + author + "/" + name + " not found");
        }
        blueprints.put(key, bp);
    }

    @Override
    public void deleteBlueprint(String author, String name) throws BlueprintNotFoundException {
        String key = author + ":" + name;
        if (!blueprints.containsKey(key)) {
            throw new BlueprintNotFoundException("Blueprint " + author + "/" + name + " not found");
        }
        blueprints.remove(key);
    }
}
