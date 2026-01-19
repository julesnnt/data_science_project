# 📚 Project Wiki – California Wildfire Watch

## 🔥 Overview

This project visualizes wildfire incidents across California between 2013–2023. The aim is to inform citizens and professionals about the frequency, severity, and location of wildfires using accessible data visuals.

---

## 🧩 Components

### 1. **Fire Map (main.js)**
- Maps fire data year by year.
- Circles represent fire size.
- Interactive timeline to visualize evolution.

### 2. **Bubble Chart (bubble_chart.js)**
- Focus on the most dangerous fires.
- Bubble size = Acres burned.
- Color = Number of fatalities.
- White stroke = Presence of injuries.

### 3. **Circle Packing (TBD)**
- Will display fires nested by year and county.
- Interactive zoom to explore clusters.

### 4. **Bar Chart Race (TBD)**
- Counties compete over time based on total acres burned.
- Animated progression from 2013 to 2023.

---

## 🧪 Tech Stack

- **D3.js** – for all visualizations
- **HTML/CSS** – base structure and style
- **JavaScript (vanilla)** – interactivity
- **Swiper.js** – slide navigation
- **CSV** – raw dataset format

---

## 👥 Team

| Member | Role |
|--------|------|
| Victor | Data cleaning, EDA, Map development |
| Eve    | JS functionality, HTML integration |
| Jules  | CSS, layout, project wiki/logs |

---

## 💾 Data Source

- Dataset: [Kaggle – California Wildfire Incidents 2013–2020](https://www.kaggle.com/datasets/ananthu017/california-wildfire-incidents-20132020)

---

## 📌 How to Run Locally

1. Clone the repo.
2. Place the CSV file in the root directory.
3. Open `index.html` in your browser.
4. Use DevTools console if needed to debug or inspect.

---

## 🎯 To-Do List

- [ ] Deploy final version on GitHub Pages or Netlify
- [ ] Polish responsive design
- [ ] Final round of testing on different screen sizes
