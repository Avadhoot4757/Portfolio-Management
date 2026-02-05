package org.example.controller;

import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.example.model.PortfolioPerformance;
import org.example.service.PortfolioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    /**
     * Adds a new asset lot to the portfolio.
     * Use @DateTimeFormat to ensure Spring can parse the Postman date string.
     */
    @PostMapping("/add")

    public PortfolioAsset add(@RequestParam String symbol,
                              @RequestParam AssetType type,
                              @RequestParam BigDecimal quantity,
                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime buyTime) {

        // We now pass ONLY the time to the service; the service will find the price.
        return service.addAssetWithHistoricalPrice(symbol, type, quantity, buyTime);
    }

    /**
     * Removes a specific asset lot by its database ID.
     */
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        service.removeAsset(id);
        return ResponseEntity.noContent().build(); // Returns 204 No Content on success
    }

    @GetMapping
    public List<PortfolioAsset> getAll() {
        return service.getAllAssets();
    }

    @GetMapping("/value")
    public PortfolioPerformance totalValue() {
        return service.getPerformance();
    }

    @GetMapping("/performance")
    public PortfolioPerformance performance() {
        return service.getPerformance();
    }

    @GetMapping("/{id}")
    public PortfolioPerformance getById(@PathVariable Long id) {
        // service.getPerformanceById should throw ResourceNotFoundException if id is invalid
        return service.getPerformanceById(id);
    }
}