package org.example.controller;

import org.example.service.CryptoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crypto")
public class CryptoController {

    private final CryptoService cryptoService;

    public CryptoController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    @GetMapping("/top")
    public String topCryptos() throws Exception {
        return cryptoService.getTopCryptos();
    }

    @GetMapping("/{symbol}")
    public String price(@PathVariable String symbol) throws Exception {
        return cryptoService.getCryptoPrice(symbol);
    }
}
