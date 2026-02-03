package org.example.repository;

import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<PortfolioAsset, Long> {

    Optional<PortfolioAsset> findBySymbol(String symbol);

    List<PortfolioAsset> findByAssetType(AssetType assetType);
}
