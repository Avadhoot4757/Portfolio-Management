package org.example.service;

import org.example.model.WatchlistSector;
import org.example.repository.WatchlistSectorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class WatchlistSectorService {

    private final WatchlistSectorRepository repository;

    private static final List<String> SECTOR_CATALOG = List.of(
            "Technology",
            "Financials",
            "Healthcare",
            "Consumer Discretionary",
            "Consumer Staples",
            "Industrials",
            "Energy",
            "Utilities",
            "Materials",
            "Real Estate",
            "Communication Services"
    );

    public WatchlistSectorService(WatchlistSectorRepository repository) {
        this.repository = repository;
    }

    public List<String> getCatalog() {
        return SECTOR_CATALOG;
    }

    public List<WatchlistSector> getAll() {
        return repository.findAll();
    }

    @Transactional
    public WatchlistSector add(String name) {
        String normalized = normalizeSectorName(name);
        return repository.findByNameIgnoreCase(normalized)
                .orElseGet(() -> repository.save(new WatchlistSector(normalized)));
    }

    @Transactional
    public void remove(String name) {
        repository.deleteByNameIgnoreCase(name);
    }

    private String normalizeSectorName(String name) {
        if (name == null) return null;
        String trimmed = name.trim();
        if (trimmed.isEmpty()) return trimmed;
        for (String sector : SECTOR_CATALOG) {
            if (sector.equalsIgnoreCase(trimmed)) {
                return sector;
            }
        }
        return trimmed.substring(0, 1).toUpperCase(Locale.US) +
                trimmed.substring(1).toLowerCase(Locale.US);
    }
}
