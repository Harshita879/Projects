# Disease Severity Classification (M3S Dataset)

## What This Project Does

This notebook performs **binary classification of medical text** into "severe" vs "not-severe" using the M3S (Medical Severity Scoring) dataset. It compares three approaches — a simple rule-based keyword matcher, few-shot prompting with Flan-T5, and a fine-tuned BioClinicalBERT transformer — providing exhaustive performance analysis with clinical interpretability. The notebook produces multiple CSV/TXT reports with confusion matrices, per-class metrics, clinical suitability assessments, and method comparison tables.

## The Dataset — M3S

Four CSV files are loaded and combined:

| Document Type | Records | Description |
|---------------|---------|-------------|
| Discharge Summaries | 3,840 | Patient discharge notes |
| Nurse Letters | variable | Nursing documentation |
| Physician Letters | variable | Doctor's notes and assessments |
| Radiology Reports | variable | Imaging findings |

Each record has a `text` column (the medical narrative) and a `severity_label` column. The text contains `[entity]` markers indicating annotated medical entities. Multiple rows may share the same base sentence but with different entity positions — each row is a distinct annotation example.

### Label Parsing

Raw severity labels are parsed into a hierarchy: `none < mild < moderate < severe`. Multi-severity labels (e.g., "moderate to severe") are resolved to the highest severity. For binary classification, labels are collapsed: **severe = 1, everything else = 0**.

The dataset is heavily imbalanced — approximately 96.7% not-severe and 3.3% severe.

## Architecture — Three Methods Compared

### Method 1: Rule-Based Classifier

The simplest possible approach: if the text contains the word "severe", predict severe (1); otherwise predict not-severe (0). This establishes a floor — any ML method should beat this.

### Method 2: Few-Shot with Flan-T5

Google's Flan-T5-base model is given 5 labelled examples in the prompt and asked to classify each test sample. The prompt includes clinical examples with clear severe and non-severe patterns. Text is truncated to 400 characters to fit the model's context window. No fine-tuning is performed.

### Method 3: Fine-Tuned BioClinicalBERT

`emilyalsentzer/Bio_ClinicalBERT` — a BERT model pre-trained on clinical notes from MIMIC-III — is fine-tuned on the training split for 5 epochs. Key design decisions:

- **Weighted loss**: A custom `WeightedTrainer` applies `sklearn`'s `compute_class_weight('balanced')` to upweight the minority severe class, counteracting the 97/3 imbalance.
- **Data splitting**: To prevent information leakage, splits are done at the *base sentence* level (ignoring entity marker positions). All annotations of the same sentence go into the same split.
- **Stratified splits**: 80% train, 10% validation, 10% test, stratified by label.
- **Training config**: batch size 8, weight decay 0.01, 100 warmup steps, best model selected by validation loss.

## The Evaluation Pipeline

This is where the notebook really shines — the evaluation is more thorough than most research papers.

### Binary Metrics (per method)

For each of the three methods, the notebook computes: accuracy, Matthews Correlation Coefficient, per-class precision/recall/F1, confusion matrix (TN/FP/FN/TP), sensitivity, specificity, false positive rate, false negative rate, PPV, NPV.

### Clinical Interpretation

Each metric is explained in clinical terms: "Missed X severe cases" is flagged with danger warnings, false alarm counts are assessed for alert fatigue potential, and an overall clinical suitability rating is given (SUITABLE / ACCEPTABLE / CAUTIOUS USE / NOT RECOMMENDED).

### Misclassification Analysis

Example false negatives (missed severe cases) and false positives (false alarms) are printed with their source text, true label, and document type.

### Multi-Class Extension

The final cells compute 4-class metrics (none/mild/moderate/severe) for all three methods, with per-class precision/recall/F1 and confusion matrices.

### Generated Reports

The notebook produces the following files in `experiment_results/`:

| File | Contents |
|------|----------|
| `01_overall_summary_*.csv` | All metrics for all methods |
| `02_per_class_metrics_*.csv` | Detailed per-class breakdown |
| `03_confusion_matrices_*.csv` | Confusion matrix details |
| `04_why_analysis_*.csv` | Explanations of why each method performs the way it does |
| `MASTER_REPORT_*.csv` | All 4-class metrics in one table |
| `PER_CLASS_DETAILED_*.csv` | 4-class per-class breakdown |
| `CONFUSION_MATRICES_*.csv` | 4-class confusion matrices |
| `METHOD_COMPARISON_*.csv` | Which method wins for each class |
| `SUMMARY_*.txt` | Human-readable summary |
| `method_comparison_cleaned.png` | Bar chart of accuracy and F1 |
| `comprehensive_comparison.png` | 9-panel visual comparison |

## How to Run It

### On Kaggle (Recommended — GPU Required)

1. Create a new Kaggle notebook with **GPU accelerator enabled**.
2. Add the dataset: search for "M3S dataset" on Kaggle (or upload the four CSVs manually).
3. Ensure the CSV paths match:
   - `/kaggle/input/m3s-dataset/M3S-Discharge-Summaries.csv`
   - `/kaggle/input/m3s-dataset/M3S-Nurse_Letters.csv`
   - `/kaggle/input/m3s-dataset/M3S-Physician-Letters.csv`
   - `/kaggle/input/m3s-dataset/M3S-Radiology-Reports.csv`
4. Run all cells sequentially. Total runtime: ~30-60 minutes (BioClinicalBERT training + Flan-T5 inference).

### Locally

1. Install dependencies:

```bash
pip install transformers torch scikit-learn pandas numpy matplotlib tqdm
```

2. Ensure you have a CUDA-capable GPU (strongly recommended) or be prepared for multi-hour CPU training.
3. Download the M3S dataset and update the CSV paths in Cell 1.
4. Run all cells in order.

### Important: Cell Order Matters

The notebook has 17 cells that must run sequentially. Later cells depend on variables and DataFrames created earlier (e.g., `test_df_new`, `results`, `trainer_new`). Do not skip cells.

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `transformers` | ≥4.30 | BioClinicalBERT, Flan-T5, Trainer API |
| `torch` | ≥2.0 | PyTorch backend for transformers |
| `scikit-learn` | ≥1.0 | Metrics, class weights, train/test split |
| `pandas` / `numpy` | — | Data manipulation |
| `matplotlib` | — | Comparison charts |
| `tqdm` | — | Progress bars for Flan-T5 inference |

## Key Design Decisions Explained

### Why Binary Classification?

The dataset is heavily skewed toward none/mild. A 4-class model would struggle with the extreme imbalance. Binary (severe vs not-severe) is the clinically meaningful question: *should this patient be flagged for urgent review?*

### Why BioClinicalBERT?

Standard BERT doesn't understand medical terminology well. BioClinicalBERT was pre-trained on 2 million clinical notes from MIMIC-III, giving it domain-specific knowledge of medical vocabulary, abbreviations, and severity indicators that general-purpose models miss.

### Why Weighted Loss?

With ~3% severe cases, an unweighted model would achieve 97% accuracy by always predicting "not-severe". The weighted loss forces the model to pay ~30x more attention to severe examples (the exact weight ratio is computed dynamically from class frequencies).

### Why Split by Base Sentence?

The same sentence appears multiple times with `[entity]` markers in different positions. If one annotation goes to train and another to test, the model effectively sees the test sentence during training — this is data leakage. Splitting by the underlying sentence (with markers removed) prevents this.

## Limitations & Notes

- The multi-class evaluation (Cell 16) uses a simplification: binary predictions of "not-severe" are mapped back to the true multi-class label rather than a predicted sub-class. This means non-severe precision/recall for none/mild/moderate classes are inflated.
- Flan-T5 few-shot inference on the full test set takes 5-10 minutes even on GPU.
- The rule-based classifier is intentionally naive — it only checks for the literal word "severe" and misses any implicit severity.
- Model checkpoints are saved to `./results_cleaned/` during training but not explicitly exported for deployment.
- The notebook does not implement threshold tuning — adjusting the classification threshold (default 0.5) could improve recall at the cost of precision, which is often the right trade-off in clinical settings.
