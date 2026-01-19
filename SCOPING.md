# 🔍 Scoping Document

## 🧨 Problem Statement
California experiences frequent wildfires that pose serious threats to lives, property, and ecosystems. This project aims to help citizens and professionals understand where and how often these fires occur through an interactive visualization tool.

## 🎯 Target Audience
**Primary Audience:**  
- Citizens of California who want to monitor nearby wildfires.

**Secondary Audience:**  
- Real estate professionals, urban planners, and public authorities.

**User Tasks:**
- Check if there are or have been wildfires near a specific location.
- View historical patterns over time.
- Make informed decisions based on fire frequency.

**Benefits of the Visualization:**
- Promotes public safety through awareness.
- Assists in real estate evaluations and risk analysis.
- Offers an intuitive and accessible way to explore wildfire data.

## 📊 Data Sources

- **Main Dataset:**  
  [California Wildfire Incidents (2013–2020)](https://www.kaggle.com/datasets/ananthu017/california-wildfire-incidents-20132020)  
  - Strengths: Detailed and long-term coverage.  
  - Weaknesses: Missing values, poorly formatted coordinates.

- **Backup Plan:**  
  If the dataset is unavailable or incomplete, we will switch to another open dataset on wildfires. No simulated data will be used.

- **Data Format:** CSV

- **Cleaning Approach:**
  - Removed columns with more than 50% missing/invalid data.
  - Replaced other missing entries with "missing value".
  - Corrected GPS coordinates based on California's boundaries.

## 🧠 Design Choices
- Interactive map with location filters.
- Timeline filters for historical trends.
- Simple UI using HTML/CSS/JavaScript.
