# 🧾 Project Development Log – California Wildfire Watch

## 🔍 Exploratory Data Analysis (EDA) – Victor

- ✅ Loaded the dataset from Kaggle (2013–2020 wildfire incidents in California).
- ✅ Removed columns with more than 50% missing or erroneous data.
- ✅ Replaced missing values in valid columns with "missing value".
- ✅ Fixed latitude/longitude errors (e.g., missing minus signs).
- ✅ Filtered the dataset to include only valid incidents within California boundaries.
- ✅ Created summaries for:
  - Burned area over time
  - Number of fires per year
  - Fatalities and injuries by incident

---

## 🧠 Brainstorming & Ideation

- 💬 Defined the project scope and target users.
- 🧭 Decided to create 4 visualizations:
  - Interactive fire map (timeline)
  - Circle packing by year/county
  - Bar chart race by burned area
  - Bubble chart showing severity (deaths/injuries)

---

## 💻 Development Log

### 🌐 `index.html` — Page Structure

- 🎨 Integrated Swiper.js for slide-based navigation between views.
- 📍 Added sections: Home, Map, Circle Packing, Bar Chart Race, Bubble Chart, About.

### 📌 `main.js` — Fire Map

- 🗺️ Loaded and projected fire coordinates using D3 Geo.
- 🔥 Displayed circles sized by acres burned.
- 🎚️ Integrated timeline slider with animation and yearly filter.
- 🧪 Added tooltip with name, county, year, and burned area.

### 🎈 `bubble_chart.js` — Severity Chart

- 🧹 Cleaned and filtered data for most severe fires.
- 💀 Bubble size = area; color = deaths; white outline = injuries.
- 🖱️ Click interaction to show details in tooltip.
- 🎨 Added gradient legend + custom injury legend (white stroke).

---

## 🚀 Milestones

- [x] Data preprocessing completed
- [x] Fire map working with slider
- [x] Bubble chart coded and styled
- [X] Final deployment & polish
