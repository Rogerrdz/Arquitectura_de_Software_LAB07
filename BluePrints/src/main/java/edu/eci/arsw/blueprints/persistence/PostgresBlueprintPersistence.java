package edu.eci.arsw.blueprints.persistence;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;

/**
 * PostgreSQL-based implementation of BlueprintPersistence using JPA.
 * Activated with the 'postgres' Spring profile.
 */
@Repository
@Profile("postgres")
public class PostgresBlueprintPersistence implements BlueprintPersistence {

    @Autowired
    private PostgresBlueprintRepository repository;

    @Override
    @Transactional
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        if (repository.existsByAuthorAndName(bp.getAuthor(), bp.getName())) {
            throw new BlueprintPersistenceException(
                "Blueprint already exists: " + bp.getAuthor() + "/" + bp.getName()
            );
        }
        repository.save(bp);
    }

    @Override
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        return repository.findByAuthorAndName(author, name)
            .orElseThrow(() -> new BlueprintNotFoundException(
                "Blueprint not found: " + author + "/" + name
            ));
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        List<Blueprint> blueprints = repository.findByAuthor(author);
        if (blueprints.isEmpty()) {
            throw new BlueprintNotFoundException("No blueprints for author: " + author);
        }
        return new HashSet<>(blueprints);
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(repository.findAll());
    }

    @Override
    @Transactional
    public void addPoint(String author, String name, int x, int y) throws BlueprintNotFoundException {
        Blueprint bp = getBlueprint(author, name);
        bp.addPoint(new Point(x, y));
        repository.save(bp);
    }

    @Override
    @Transactional
    public void updateBlueprint(String author, String name, Blueprint bp) throws BlueprintNotFoundException {
        Blueprint existing = getBlueprint(author, name);
        existing.setPoints(bp.getPoints());
        repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint bp = getBlueprint(author, name);
        repository.delete(bp);
    }
}
