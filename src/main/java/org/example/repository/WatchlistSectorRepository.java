package org.example.repository;

import org.example.model.WatchlistSector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchlistSectorRepository extends JpaRepository<WatchlistSector, Long> {
    Optional<WatchlistSector> findByNameIgnoreCase(String name);
    void deleteByNameIgnoreCase(String name);
}
