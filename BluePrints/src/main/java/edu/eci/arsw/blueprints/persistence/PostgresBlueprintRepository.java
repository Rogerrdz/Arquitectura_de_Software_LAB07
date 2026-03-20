package edu.eci.arsw.blueprints.persistence;

import edu.eci.arsw.blueprints.model.Blueprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostgresBlueprintRepository extends JpaRepository<Blueprint, Long> {
    
    /**
     * Find a blueprint by author and name
     * @param author the author name
     * @param name the blueprint name
     * @return Optional containing the blueprint if found
     */
    Optional<Blueprint> findByAuthorAndName(String author, String name);
    
    /**
     * Find all blueprints by a specific author
     * @param author the author name
     * @return List of blueprints by the author
     */
    List<Blueprint> findByAuthor(String author);
    
    /**
     * Check if a blueprint with the given author and name exists
     * @param author the author name
     * @param name the blueprint name
     * @return true if exists, false otherwise
     */
    boolean existsByAuthorAndName(String author, String name);
    
    /**
     * Get all distinct authors who have blueprints
     * @return List of unique author names
     */
    @Query("SELECT DISTINCT b.author FROM Blueprint b ORDER BY b.author")
    List<String> findAllAuthors();
}
