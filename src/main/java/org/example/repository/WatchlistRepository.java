package org.example.repository;

import org.example.model.WatchlistAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistAsset, Long> {
    Optional<WatchlistAsset> findBySymbol(String symbol);
    Optional<WatchlistAsset> findBySymbolIgnoreCase(String symbol);
    void deleteBySymbol(String symbol);
    void deleteBySymbolIgnoreCase(String symbol);
}
