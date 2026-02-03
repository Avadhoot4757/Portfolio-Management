package org.example.controller;

import org.example.client.StockClient;
import org.example.dto.MarketQuote;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stocks")
public class StockController {

    private final StockClient stockClient;

    public StockController(StockClient stockClient) {
        this.stockClient = stockClient;
    }

    @GetMapping("/quote/{symbol}")
    public MarketQuote getQuote(@PathVariable String symbol) {
        return stockClient.getStockQuote(symbol);
    }
}
