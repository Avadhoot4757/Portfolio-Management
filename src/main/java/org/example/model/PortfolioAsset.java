package org.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_assets")
public class PortfolioAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticker;
    private double quantity;
    private double buyPrice;
    private LocalDateTime buyTime;

    public PortfolioAsset() {}

    public PortfolioAsset(Long id, String ticker, double quantity, double buyPrice, LocalDateTime buyTime) {
        this.id = id;
        this.ticker = ticker;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.buyTime = buyTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public double getBuyPrice() { return buyPrice; }
    public void setBuyPrice(double buyPrice) { this.buyPrice = buyPrice; }

    public LocalDateTime getBuyTime() { return buyTime; }
    public void setBuyTime(LocalDateTime buyTime) { this.buyTime = buyTime; }
}
