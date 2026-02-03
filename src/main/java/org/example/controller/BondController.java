package org.example.controller;

import org.example.client.BondClient;
import org.example.dto.MarketQuote;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bonds")
public class BondController {

    private final BondClient bondClient;

    public BondController(BondClient bondClient) {
        this.bondClient = bondClient;
    }

    @GetMapping("/quote/{symbol}")
    public MarketQuote getQuote(@PathVariable String symbol) {
        return bondClient.getBondYield(symbol);
    }
}
