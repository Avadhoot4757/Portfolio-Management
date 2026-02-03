package org.example.service;

import org.example.client.CryptoClient;
import org.springframework.stereotype.Service;

@Service
public class CryptoService {

    private final CryptoClient cryptoClient;

    public CryptoService(CryptoClient cryptoClient) {
        this.cryptoClient = cryptoClient;
    }

    public String getTopCryptos() throws Exception {
        return cryptoClient.getLatestListings(1, 50, "USD");
    }

    public String getCryptoPrice(String symbol) throws Exception {
        return cryptoClient.getQuote(symbol, "USD");
    }
}
