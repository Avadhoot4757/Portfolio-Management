package org.example.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CryptoClient {

    private final RestClient restClient;

    public CryptoClient(@Value("${coinmarketcap.api.url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Value("${coinmarketcap.api.key}")
    private String apiKey;

    public String getLatestListings(int start, int limit, String convert) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/cryptocurrency/listings/latest")
                        .queryParam("start", start)
                        .queryParam("limit", limit)
                        .queryParam("convert", convert)
                        .build())
                .header("X-CMC_PRO_API_KEY", apiKey)
                .retrieve()
                .body(String.class);
    }

    public String getQuote(String symbol, String convert) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/cryptocurrency/quotes/latest")
                        .queryParam("symbol", symbol)
                        .queryParam("convert", convert)
                        .build())
                .header("X-CMC_PRO_API_KEY", apiKey)
                .retrieve()
                .body(String.class);
    }
}
