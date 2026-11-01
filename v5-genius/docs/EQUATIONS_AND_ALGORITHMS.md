
# Equations and Algorithms - v5 Genius

## All Equations Implemented

### #126 Neuromuscular
- RSI = FT / CT (Flanagan 2008)
- Peak Power = 60.7*JH + 45.3*BM - 2055 (Sayers 1991)
- RFD = ΔF / Δt
- RSI_mod = JH / CT
- ML: Random Forest 100 trees for 5 profiles

### #127 Readiness
- Readiness = Σ(w_i * norm(factor_i)) Bayesian
- w_i adaptive with RL
- LSTM: HRV 7-day sequence → fatigue prediction
- Illness: IF RHR > avg+10 AND HRV < 40 AND sleep <6 THEN risk

### #128 ACWR
- Acute = avg 7d, Chronic = avg 28d or EWMA α=0.25
- ACWR = Acute/Chronic (Gabbett zones 0.8-1.3 safe)
- Monotony = Mean/SD (Foster 1998)
- Strain = Load * Monotony
- Injury Risk = 1/(1+exp(-(acwr*2+monotony*1.5+history*0.5-3))) Logistic Regression

... and 8 more tools with full equations
