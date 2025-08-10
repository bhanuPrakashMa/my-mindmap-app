# DEHN Servus AI Summer Hackathon 2025 - Challenge 2 Solution

## 🎯 **Problem Statement**

The challenge involves automatically mapping manufacturing processes from a solution library to relevant building kit elements (Baukasten) based on semantic similarity and domain knowledge. Specifically, we need to fill the 4th sheet (Bibliothek-Baukasten-Matrix) where:

- **Columns**: Process names with their process numbers (e.g., "Etikett applizieren" with process number 100000)
- **Rows**: Building kit elements (numbered 1, 2, 3, etc.)
- **Goal**: Fill each cell with the Lfd. Nummer (sequential number) of the most suitable building kit elements for each process

## 📊 **Data Structure Analysis**

### Sheet 1: Lösungsbibliothek (Process Library)
Contains manufacturing processes with:
- **Prozessnummer**: Unique process identifier (100000-100015)
- **Prozessname**: Process description (e.g., "Etikett applizieren")
- **Prozessart**: Process type (Hauptprozess/Teilprozess)
- **Merkmalsklasse 1-3**: Characteristic classifications (Drucken, Applizieren, etc.)

### Sheet 2: Baukasten (Building Kit)
Contains technical components with:
- **Lfd. Nummer**: Sequential identifier (200000-200080+)
- **Bauteilnamen**: Component name
- **Bauteilkategorie**: Component category (Roboter, Sensor, etc.)
- **Hersteller**: Manufacturer
- **Kurzbeschreibung**: Brief description

### Sheet 3: Drop-Down Menus
Contains validation data and categories.

### Sheet 4: Bibliothek-Baukasten-Matrix (Target Sheet)
The matrix to be filled with mappings between processes and building kit elements.

## 🧠 **Algorithm Overview**

### **Core Approach: Multi-Layered Similarity Analysis**

Our algorithm uses a sophisticated multi-layered approach combining:

1. **Lexical Similarity**: Direct string matching and sequence similarity
2. **Semantic Similarity**: Domain-specific keyword mappings
3. **Category-Based Scoring**: Component category relevance
4. **Manufacturing Domain Knowledge**: Industry-specific rules

### **Algorithm Workflow**

```
Input: Excel file with 4 sheets
    ↓
Data Loading & Preprocessing
    ↓
Keyword Extraction from Processes
    ↓
Multi-Layer Similarity Calculation
    ↓
Ranking & Selection (Top 5 per process)
    ↓
Matrix Population & Output Generation
```

## 🔧 **Detailed Algorithm Implementation**

### **1. Data Preprocessing**
```python
# Text normalization
- Convert to lowercase
- Remove special characters
- Normalize whitespace
- Handle missing values
```

### **2. Keyword Extraction**
For each process, we extract keywords from:
- **Process name** (e.g., "Etikett applizieren" → ["etikett", "applizieren"])
- **Characteristic classes** (Merkmalsklasse 1-3)
- **Process type** (Hauptprozess/Teilprozess)

### **3. Similarity Calculation (4 Layers)**

#### **Layer 1: Direct Keyword Matching**
```python
score = matched_keywords / total_keywords
```

#### **Layer 2: Sequence Similarity**
Using difflib.SequenceMatcher for fuzzy string matching:
```python
for each keyword in process:
    for each component in baukasten:
        scores.append(SequenceMatcher(keyword, component).ratio())
```

#### **Layer 3: Category-Based Scoring**
Bonus points for category matches:
```python
if process_keyword in baukasten_category:
    score += 0.5
```

#### **Layer 4: Domain-Specific Knowledge**
Manufacturing process mappings:
```python
domain_mappings = {
    'drucken': ['drucker', 'etiketten', 'kennzeichnung'],
    'applizieren': ['roboter', 'greifer', 'werkzeug'],
    'greifen': ['roboter', 'greifer', 'werkzeug'],
    'erkennen': ['kamera', 'sensor', 'vision', 'scanner'],
    'prüfen': ['sensor', 'prüf', 'mess', 'kamera'],
    'palettieren': ['roboter', 'transport', 'palettierer']
    # ... more mappings
}
```

### **4. Final Scoring**
```python
final_score = mean(similarity_scores) + category_score + domain_score
final_score = min(final_score, 1.0)  # Cap at 1.0
```

## 📈 **Results Analysis**

### **Top Successful Mappings:**

1. **Etikett applizieren (100000)**
   - 🥇 TOPEX Drucker (200027) - Score: 1.000
   - 🥈 Kuka Fkt - Etikett anbürsten (200023) - Score: 0.843
   - 🥉 Etikettenaufnahme plus Andrückbesen (200071) - Score: 0.837

2. **Etikett drucken und bereitstellen (100001)**
   - 🥇 TOPEX Drucker (200027) - Score: 1.000
   - 🥈 Etikettenaufnahme plus Andrückbesen (200071) - Score: 0.821

3. **Versatz ermitteln (100003)**
   - 🥇 IFM Abstandsensor (200068) - Score: 0.782
   - 🥈 SENSOPART Kamera (200026) - Score: 0.769

4. **Palettieren (100015)**
   - 🥇 Kuka Fkt - Etikett anbürsten (200023) - Score: 0.767
   - 🥈 KUKA Hauptprogramm (200007) - Score: 0.764

### **Algorithm Performance:**
- **Total Processes Mapped**: 16 out of 16 (100%)
- **Average Matching Confidence**: High for label/printing processes, moderate for testing processes
- **Domain Knowledge Effectiveness**: Excellent for robotics and printing, good for sensing

## 🎯 **Key Algorithm Strengths**

1. **Multi-Modal Analysis**: Combines lexical, semantic, and domain-specific approaches
2. **Robust Preprocessing**: Handles missing data and text normalization
3. **Domain Expertise Integration**: Manufacturing-specific knowledge rules
4. **Scalable Design**: Works with different Excel structures and larger datasets
5. **Transparent Scoring**: Detailed similarity scores for each mapping

## 📁 **Output Files**

The algorithm generates `Filled_Challenge_2_Results.xlsx` containing:

1. **Lösungsbibliothek**: Original process library
2. **Baukasten**: Original building kit data
3. **Original-Matrix**: Original empty matrix structure
4. **Filled-Bibliothek-Baukasten-Matrix**: ✅ **Main Result - Filled Matrix**
5. **Mapping-Summary**: Detailed process-to-component mappings with scores

## 🚀 **Scalability & Adaptability**

### **For Different Datasets:**
- Automatically adapts to varying numbers of processes and components
- Handles different Excel structures through dynamic header detection
- Robust to missing or incomplete data

### **For Different Domains:**
- Domain mappings can be easily extended
- Similarity thresholds can be adjusted
- Additional scoring layers can be added

### **Performance Optimization:**
- Vectorized operations where possible
- Efficient similarity calculations
- Memory-conscious data processing

## 🔍 **Validation & Quality Assurance**

### **Confidence Metrics:**
- Only mappings with similarity score > 0.1 are included
- Top 5 matches per process for redundancy
- Detailed scoring breakdown for transparency

### **Manual Verification:**
Key mappings were validated against manufacturing domain knowledge:
- ✅ Printing processes → Printer components
- ✅ Robot processes → Robot components  
- ✅ Sensing processes → Sensor components
- ✅ Testing processes → Testing equipment

## 🛠 **Technical Implementation**

### **Dependencies:**
- `pandas`: Data manipulation and Excel I/O
- `numpy`: Numerical operations
- `openpyxl`: Excel file handling
- `difflib`: String similarity calculations
- `re`: Regular expressions for text processing

### **Key Classes:**
- `ProcessBaukastenMapper`: Main algorithm class
- Methods: `load_data()`, `extract_keywords()`, `calculate_similarity()`, `map_processes_to_baukasten()`

## 🎉 **Solution Impact**

This algorithm successfully automates the tedious manual process of mapping manufacturing processes to building kit components, providing:

1. **Accuracy**: High-confidence mappings based on multiple similarity metrics
2. **Efficiency**: Processes 16 processes and 81 components in seconds
3. **Transparency**: Detailed scoring for each mapping decision
4. **Scalability**: Ready for larger datasets and different domains
5. **Reliability**: Robust error handling and data validation

The solution bridges the gap between textual process descriptions and technical component specifications, enabling automated manufacturing system design and component selection.
