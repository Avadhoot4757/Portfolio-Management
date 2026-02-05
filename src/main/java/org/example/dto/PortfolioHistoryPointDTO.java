package org.example.dto;

import java.math.BigDecimal;

public class PortfolioHistoryPointDTO {
    private String date;
    private BigDecimal value;
    private BigDecimal invested;

    public PortfolioHistoryPointDTO() {
    }

    public PortfolioHistoryPointDTO(String date, BigDecimal value, BigDecimal invested) {
        this.date = date;
        this.value = value;
        this.invested = invested;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public BigDecimal getInvested() {
        return invested;
    }

    public void setInvested(BigDecimal invested) {
        this.invested = invested;
    }
}
