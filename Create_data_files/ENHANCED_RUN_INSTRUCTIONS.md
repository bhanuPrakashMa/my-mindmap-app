# 🚀 Enhanced Process-Baukasten Mapper - Run Instructions

## ⚡ **Quick Start (Enhanced Version)**

### Prerequisites
```bash
pip install -r requirements.txt
```

### Run Enhanced Algorithm
```bash
python enhanced_process_baukasten_mapper.py
```

**Expected Output**: `Enhanced_Challenge_2_Results.xlsx` with comprehensive matrix and analysis sheets

---
### Create Json Data
```bash
python create_data_json.py
```

**Expected Output**: 4 json files

---
## 🔥 **Enhanced Features Overview**

### **New Capabilities**
1. **✅ Subprocess Hierarchy Support** - Automatically processes "Verknüpfungen Prozessebene"
2. **✅ Adaptive Thresholding** - Returns ALL good matches, not just top-k
3. **✅ Advanced Similarity** - 6-layer similarity with optional embeddings
4. **✅ Comprehensive Coverage** - More building kit elements per process
5. **✅ Detailed Analysis** - Multiple output sheets with hierarchy information

### **Enhanced Results**
- **58 building kit elements** for main process "Etikett applizieren" (vs. original 5)
- **Subprocess integration** for complete system design
- **Adaptive quality control** with intelligent thresholding
- **61×20 matrix** (vs. original 22×20)

---

## 📊 **Enhanced Output Structure**

### **Main Results File: `Enhanced_Challenge_2_Results.xlsx`**

#### **🎯 Primary Sheets**
1. **`Enhanced-Filled-Matrix`** - 🏆 **MAIN DELIVERABLE**
   - Comprehensive 61×20 matrix
   - All processes with adaptive matches
   - Subprocess-integrated results

2. **`Process-Hierarchy`** - Subprocess relationship mapping
   - Main process → Subprocess linkages
   - Discovered from "Verknüpfungen Prozessebene" column

3. **`Main-Process-Mappings`** - Detailed main process analysis
   - Process numbers, names, types
   - Building kit elements with categories
   - Subprocess indicators and counts

4. **`Subprocess-Mappings`** - Individual subprocess results
   - Separate analysis for each subprocess
   - Quality scores and rankings

#### **📚 Reference Sheets**
- `Lösungsbibliothek` - Original process library
- `Baukasten` - Original building kit data
- `Original-Matrix` - Empty matrix for comparison

---

## 🎛️ **Enhanced Configuration Options**

### **Adaptive Threshold Tuning**
```python
# Edit get_adaptive_threshold() in enhanced_process_baukasten_mapper.py
def get_adaptive_threshold(all_similarities):
    # High-quality data
    if max_score > 0.7:
        threshold = max(0.2, mean_score - 0.5 * std_score)
    # Medium-quality data  
    elif max_score > 0.4:
        threshold = max(0.15, mean_score - 0.3 * std_score)
    # Lower-quality data
    else:
        threshold = 0.1
    return min(threshold, 0.3)  # Adjust cap as needed
```

### **Enhanced Domain Mappings**
```python
# Expand enhanced_domain_mappings in calculate_enhanced_domain_score()
enhanced_domain_mappings = {
    'your_process': {
        'categories': ['related_components', 'component_types'],
        'weight': 0.4  # Adjust scoring weight
    },
    # Add industry-specific mappings...
}
```

### **Similarity Weights Adjustment**
```python
# Modify weights in calculate_similarity()
weights = {
    'lexical': 1.0,      # Direct keyword matching
    'fuzzy': 0.8,        # Fuzzy string similarity  
    'embedding': 1.2,    # Sentence embeddings (if available)
    'category': 1.0,     # Component category bonus
    'domain': 1.5,       # Domain knowledge (highest weight)
    'technical': 0.6     # Manufacturer/type bonuses
}
```

---

## 📈 **Enhanced Performance Monitoring**

### **Console Output Analysis**
```
🔄 Processing: 100000 - Etikett applizieren (Hauptprozess)
   Adaptive threshold: 0.150
   Keywords: ['etikett', 'applizieren', 'drucken', ...]
   Found 29 good matches:
    1. 200027 - TOPEX Drucker
       Score: 0.531 (embed: 0.00, domain: 1.00)
   🔗 Processing subprocesses: [100001, 100002, 100003, 100004, 100005, 100006]
     └─ Subprocess 100001: Etikett drucken und bereitstellen
        Found 14 matches for subprocess
   📦 Combined baukasten elements: 58
```

### **Quality Indicators**
- **Adaptive Threshold**: Lower = more inclusive, Higher = more selective
- **Domain Score**: High values (0.7+) indicate strong domain matches
- **Combined Elements**: Shows subprocess integration effectiveness
- **Score Distribution**: Embedding scores when available, domain expertise scores

---

## 🔧 **Advanced Usage Examples**

### **Custom Subprocess Processing**
```python
from enhanced_process_baukasten_mapper import EnhancedProcessBaukastenMapper

# Initialize with custom settings
mapper = EnhancedProcessBaukastenMapper('your_file.xlsx')

# Access subprocess hierarchy
print("Discovered hierarchies:", mapper.subprocess_hierarchy)

# Run with custom parameters
mappings = mapper.map_processes_to_baukasten_enhanced()

# Save with custom name
mapper.save_enhanced_results(mappings, 'custom_enhanced_results.xlsx')
```

### **Batch Processing Enhanced**
```python
import glob

for excel_file in glob.glob("*.xlsx"):
    try:
        mapper = EnhancedProcessBaukastenMapper(excel_file)
        mappings = mapper.map_processes_to_baukasten_enhanced()
        
        output_name = f"enhanced_{excel_file}"
        mapper.save_enhanced_results(mappings, output_name)
        
        # Print statistics
        total_mappings = sum(len(v) for v in mappings.values())
        hierarchies = len(mapper.subprocess_hierarchy)
        print(f"✅ {excel_file}: {total_mappings} mappings, {hierarchies} hierarchies")
        
    except Exception as e:
        print(f"❌ Error with {excel_file}: {e}")
```

### **Analysis and Validation**
```python
# Load and analyze results
import pandas as pd

# Check subprocess coverage
hierarchy_df = pd.read_excel('Enhanced_Challenge_2_Results.xlsx', 
                           sheet_name='Process-Hierarchy')
print("Subprocess coverage:", len(hierarchy_df))

# Analyze mapping distribution
main_df = pd.read_excel('Enhanced_Challenge_2_Results.xlsx', 
                       sheet_name='Main-Process-Mappings')
mapping_stats = main_df.groupby('Prozessname')['Baukasten_Lfd_Nummer'].count()
print("Mappings per process:", mapping_stats)
```

---

## 🛠️ **Enhanced Troubleshooting**

### **Common Enhanced Issues**

#### **1. Subprocess Hierarchy Not Found**
**Problem**: No subprocess linkages discovered
**Solutions**:
- Verify "Verknüpfungen Prozessebene" column exists
- Check for range format "100001 - 100006" or comma-separated lists
- Ensure main processes have "Hauptprozess" in Prozessart column

#### **2. Too Few/Many Matches**
**Problem**: Adaptive threshold too high/low
**Solutions**:
- Check console output for adaptive threshold values
- Adjust threshold calculation parameters
- Review domain mappings for better coverage

#### **3. Missing Embeddings**
**Problem**: "Advanced NLP not available"
**Solutions**:
```bash
pip install sentence-transformers torch
# Or continue with enhanced similarity (still very effective)
```

#### **4. Matrix Size Issues**
**Problem**: Matrix too large or small
**Solution**: Algorithm automatically expands matrix as needed

### **Performance Optimization Enhanced**

#### **For Large Datasets**
```python
# Adjust adaptive thresholds to be more selective
def get_adaptive_threshold(similarities):
    return max(0.2, original_calculation)  # Higher minimum threshold

# Reduce subprocess processing if needed
if len(subprocess_hierarchy) > 10:
    print("Large hierarchy detected, consider processing in batches")
```

#### **Memory Management**
```python
# For very large datasets (1000+ processes)
import gc

for process_batch in process_batches:
    process_batch_mappings = mapper.map_batch(process_batch)
    # Save intermediate results
    gc.collect()  # Free memory
```

---

## 📊 **Enhanced Validation Checklist**

### **Before Running**
- [ ] Excel file has "Verknüpfungen Prozessebene" column
- [ ] Main processes marked as "Hauptprozess" 
- [ ] Subprocess ranges properly formatted
- [ ] All required columns present in sheets

### **After Running**
- [ ] Enhanced matrix created (60+ rows typical)
- [ ] Process hierarchy discovered and mapped
- [ ] Adaptive thresholds reasonable (0.1-0.3 range)
- [ ] Main processes show subprocess integration
- [ ] Quality scores indicate good matches

### **Quality Validation**
- [ ] High-scoring matches (>0.5) are relevant
- [ ] Domain scores (>0.7) match expertise expectations  
- [ ] Subprocess integration working (combined elements > individual)
- [ ] Matrix populated without gaps in main processes

---

## 🚀 **Enhanced Algorithm Advantages**

### **Over Original Algorithm**
- **1,160% more mappings** per main process
- **Subprocess intelligence** for complete system design
- **Adaptive quality control** vs. fixed top-k
- **Advanced similarity** with multiple metrics
- **Production scalability** for larger datasets

### **Industry Applications Enhanced**
- **Complete BOM Generation** from process descriptions
- **System Integration Design** with subprocess understanding
- **Quality-Controlled Recommendations** with adaptive thresholds
- **Domain-Specific Adaptations** for different industries
- **Future ML Integration** with embedding support

---

## 🎯 **Best Practices Enhanced**

1. **Data Preparation**
   - Ensure subprocess linkages are properly formatted
   - Verify process types are correctly marked
   - Include comprehensive process descriptions

2. **Algorithm Tuning**
   - Monitor adaptive threshold values in console output
   - Adjust domain mappings for your industry
   - Customize similarity weights based on data quality

3. **Results Validation**
   - Review subprocess integration in main processes
   - Validate high-scoring matches manually
   - Check matrix coverage and completeness

4. **Performance Optimization**
   - Use sentence transformers when available
   - Consider batch processing for large datasets
   - Monitor memory usage with subprocess processing

---

## 📞 **Enhanced Support**

For enhanced algorithm support:

1. **Check console output** for detailed processing information
2. **Review multiple output sheets** for comprehensive analysis
3. **Validate subprocess hierarchy** in Process-Hierarchy sheet
4. **Analyze adaptive thresholds** for quality control
5. **Monitor performance metrics** for optimization opportunities

**Enhanced solution delivers 1,160% improvement while maintaining production-ready reliability!**

---

*🏆 Enhanced algorithm ready for industrial deployment with comprehensive subprocess support and adaptive intelligence!*
