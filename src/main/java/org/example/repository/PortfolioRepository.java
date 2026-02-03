package org.example.repository;


import org.example.model.PortfolioAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<PortfolioAsset, Long> {
    Optional<PortfolioAsset> findByTicker(String ticker);
}