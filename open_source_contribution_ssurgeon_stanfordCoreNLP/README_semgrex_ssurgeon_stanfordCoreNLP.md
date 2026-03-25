# Stanford CoreNLP: Semgrex & Ssurgeon Notebooks — Complete Documentation

---

## Table of Contents

1. [Overview — What Is This Project?](#1-overview--what-is-this-project)
2. [Background Concepts](#2-background-concepts)
3. [Notebook 1: `semgrex-ssurgeon.ipynb` — Fashion Semantic Search](#3-notebook-1-semgrex-ssurgeonipynb--fashion-semantic-search)
4. [Notebook 2: `ssurgeon-mergenodes__1_.ipynb` — MergeNodes Testing](#4-notebook-2-ssurgeon-mergenodes1ipynb--mergenodes-testing)
5. [Notebook 3: `ssurgeon-addedge.xpynb` — AddEdge (Empty)](#5-notebook-3-ssurgeon-addedgexpynb--addedge-empty)
6. [Notebook 4: `ssurgeon-addnode.xpynb` — AddNode (Empty)](#6-notebook-4-ssurgeon-addnodexpynb--addnode-empty)
7. [Environment & Setup (Common to All Notebooks)](#7-environment--setup-common-to-all-notebooks)
8. [Key Findings & Takeaways](#8-key-findings--takeaways)
9. [Troubleshooting & Common Issues](#9-troubleshooting--common-issues)

---

## 1. Overview — What Is This Project?

This is a collection of four Kaggle notebooks that explore **Stanford CoreNLP's Semgrex and Ssurgeon** libraries. The goal is to understand, test, and document how these NLP tools work for **pattern matching on dependency parse trees** (Semgrex) and **programmatically editing those trees** (Ssurgeon).

The notebooks were built on Kaggle using Python as a wrapper to compile and execute Java code against the Stanford CoreNLP 4.5.5 toolkit. Two of the four uploaded files are empty (0-byte `.xpynb` files), so this README covers the two substantive notebooks in full detail and documents the empty ones for completeness.

**Why does this matter?** Dependency parsing is a foundational NLP technique. Being able to *search* parse trees (Semgrex) and then *surgically edit* them (Ssurgeon) is critical for tasks like information extraction, grammar correction, text normalization (e.g., merging compound nouns like "ice cream" → "icecream"), and building rule-based NLP pipelines.

---

## 2. Background Concepts

### 2.1 Stanford CoreNLP

Stanford CoreNLP is a Java-based NLP toolkit that provides a pipeline of annotators: tokenization, sentence splitting, POS tagging, lemmatization, named entity recognition, dependency parsing, coreference resolution, and more. It produces **dependency graphs** — directed graphs where each word in a sentence is a node, and edges represent grammatical relationships (subject, object, modifier, etc.).

### 2.2 Dependency Graphs

For the sentence *"The child likes ice cream."*, CoreNLP produces:

```
root(ROOT-0, likes-3)
det(child-2, The-1)
nsubj(likes-3, child-2)
compound(cream-5, ice-4)
obj(likes-3, cream-5)
punct(likes-3, .-6)
```

This means: "likes" is the root verb, "child" is its subject (`nsubj`), "cream" is its object (`obj`), "ice" modifies "cream" via a `compound` relation, and "The" is a determiner (`det`) of "child".

### 2.3 Semgrex (Semantic Graph Regular Expressions)

Semgrex is a pattern-matching language for dependency graphs, analogous to how regex works for strings. It lets you write patterns like:

```
{word:wear} >obl:to ({word:/party|wedding/}=occasion)
```

This matches a node whose word is "wear" that has an oblique-to relation pointing to a node whose word is "party" or "wedding", and captures that matched node under the name `occasion`.

**Key Semgrex syntax:**

| Symbol | Meaning |
|--------|---------|
| `{}` | Match any node |
| `{word:X}` | Match a node whose word is X |
| `{word:/regex/}` | Match a node whose word matches the regex |
| `>rel` | Has a child via relation `rel` |
| `<rel` | Has a parent via relation `rel` |
| `=name` | Capture the matched node as `name` |

### 2.4 Ssurgeon (Semantic Surgeon)

Ssurgeon is a graph-editing companion to Semgrex. After Semgrex finds a pattern in a dependency graph, Ssurgeon can apply edits: add nodes, add edges, remove nodes, remove edges, or **merge nodes**. It's used to programmatically restructure parse trees.

**Key Ssurgeon operations tested in these notebooks:**

| Operation | What It Does |
|-----------|-------------|
| `MergeNodes` | Combines two words into one (e.g., "ice" + "cream" → "icecream") |
| `AddEdge` | Adds a new grammatical relation between two existing nodes |
| `AddNode` | Inserts a new word node into the graph |

---

## 3. Notebook 1: `semgrex-ssurgeon.ipynb` — Fashion Semantic Search

### 3.1 What It Does

This notebook builds a **Fashion Semantic Search engine** that uses Semgrex patterns to parse natural language fashion queries like *"What should I wear to a bachelor party?"* and extract structured information: the occasion (party), modifiers (bachelor), season (summer), time of day (evening), and style preferences (formal). It then generates outfit recommendations based on the extracted data.

### 3.2 Why It Exists

The notebook demonstrates a **practical, real-world application of Semgrex**: using dependency parsing patterns to extract structured intent from unstructured user queries. Instead of relying on keyword matching or ML classifiers, it uses the grammatical structure of the sentence to identify what the user is asking about.

### 3.3 Architecture

```
User Query → CoreNLP Pipeline → Dependency Graph → Semgrex Pattern Matching → Structured Result → Outfit Recommendations
```

### 3.4 Cell-by-Cell Walkthrough

**Cell 0 — Kaggle Boilerplate**
Standard Kaggle environment setup. Imports numpy and pandas (not used in this notebook but part of the Kaggle template). Lists files in the input directory.

**Cell 1 — Install Java & Download CoreNLP**
```bash
apt-get install -y openjdk-11-jdk-headless
wget https://nlp.stanford.edu/software/stanford-corenlp-4.5.5.zip
unzip -o stanford-corenlp-4.5.5.zip
```
Installs OpenJDK 11 and downloads Stanford CoreNLP 4.5.5 (~482 MB). This is required because CoreNLP is a Java library.

**Cell 2 — Download English Models**
```bash
wget http://nlp.stanford.edu/software/stanford-corenlp-4.5.5-models-english.jar
```
Downloads the English language models (~424 MB) needed for POS tagging, parsing, etc.

**Cell 3 — Set Classpath (Non-functional)**
```bash
!export CLASSPATH=...
```
**Note:** This cell doesn't actually work as intended. The `!export` command in Jupyter runs in a subshell that terminates immediately, so the classpath is not persisted. The actual classpath is set correctly later in Cell 5 via the `subprocess` call.

**Cell 4 — Verify MergeNodes Class Exists**
Uses `jar tf` to inspect the CoreNLP JAR and confirm the `MergeNodes.class` file is present. Output: `edu/stanford/nlp/semgraph/semgrex/ssurgeon/MergeNodes.class` — confirms the class is available.

**Cell 5 — The Main Program: FashionSemanticSearch.java**

This is the core cell. It writes, compiles, and runs a full Java program. Here's what the Java code does:

**NLP Pipeline Setup:**
```java
props.setProperty("annotators", "tokenize,ssplit,pos,lemma,parse,depparse");
```
Configures CoreNLP with: tokenization → sentence splitting → POS tagging → lemmatization → constituency parsing → dependency parsing.

**Semgrex Patterns (5 total):**

1. `{word:/wear|dress/} >obl:to ({word:/party|wedding|dinner|meeting|interview/}=occasion)` — Matches "wear/dress to [occasion]"
2. `{} >obl:to ({word:/party|meeting/}=occasion >compound {}=occasion_type)` — Matches occasions with compound modifiers (e.g., "bachelor party")
3. `{} >obl:to ({word:/party|dinner|meeting/}=occasion >amod {}=style)` — Matches occasions with adjective modifiers (e.g., "formal meeting")
4. `{} >obl:to ({word:/wedding|party/}=occasion >compound {word:/summer|winter|spring|fall|autumn/}=season)` — Matches seasonal occasions
5. `{} >obl:to ({word:/party|dinner/}=occasion >compound {word:/evening|morning|afternoon|night/}=time)` — Matches time-of-day occasions

**Test Queries:**
- "What should I wear to a bachelor party?"
- "I need something to wear to a summer wedding"
- "What's appropriate for a formal business meeting?"
- "What should I wear to an evening dinner party?"
- "Looking for an outfit for a casual weekend brunch"

**Outfit Recommendation Engine:**
Based on the extracted occasion, modifiers, season, and time, the program generates outfit recommendations. For example, a bachelor party yields: Button-down shirt, Dark jeans or chinos, Leather dress shoes, Sport watch.

### 3.5 Actual Output & Results

The program compiles and runs successfully. However, the Semgrex patterns **fail to match most queries**. All five queries return `"Base Occasion: not specified"` with no recommendations.

**Why the patterns don't match:**

The patterns use `>obl:to` (oblique relation with "to"), but CoreNLP's dependency parser doesn't always produce that exact relation. For example, "What should I wear to a bachelor party?" produces:
```
wear/VB (root) → party/NN (obl:to)
```
The relation IS `obl:to`, but the pattern `{word:/wear|dress/} >obl:to (...)` requires the root node to match `wear` or `dress`, and the occasion node to match specific words. The issue is that "party" matches the occasion list, but "bachelor" is connected as a `compound` of "party", not directly reachable from the first pattern. The patterns need to be applied iteratively — the first pattern detects the occasion, and the second detects the compound modifier — but the code processes them independently without combining results.

### 3.6 How to Make It Work

1. **Platform:** Run on Kaggle (the notebook is designed for the Kaggle environment).
2. **Requirements:** Internet access (to download CoreNLP), at least 2 GB RAM, ~1 GB disk for CoreNLP + models.
3. **Run order:** Execute cells 0 → 1 → 2 → 3 → 4 → 5 sequentially. Cells 1–3 take several minutes due to large downloads.
4. **To fix the pattern matching:** The Semgrex patterns need refinement. The `obl:to` relation exists in the parse, but the pattern combination logic needs work — results from multiple patterns should be merged into a single `FashionSearchResult` per query rather than treated independently. Also, some queries use `obl:for` instead of `obl:to` (e.g., "appropriate **for** a formal business meeting"), so patterns should be expanded to cover both prepositions.

---

## 4. Notebook 2: `ssurgeon-mergenodes__1_.ipynb` — MergeNodes Testing

### 4.1 What It Does

This notebook systematically tests the **Ssurgeon MergeNodes** operation — which is supposed to combine two words in a dependency graph into a single compound word. The specific test case is merging "ice" and "cream" into "icecream" in the sentence *"The child likes ice cream."*

It also tests **cross-sentence Semgrex matching** and **coreference resolution** as a secondary experiment.

### 4.2 Why It Exists

The notebook is an **investigative debugging exercise**. The author wanted to use Ssurgeon's `MergeNodes` to merge compound nouns, discovered it wasn't working as expected, and documented the behavior through multiple approaches: using the Ssurgeon API directly, comparing with a manual graph edit, and trying different API methods (`execute()` vs `evaluate()`).

### 4.3 Cell-by-Cell Walkthrough

**Cells 0–1 — Documentation Comments**
Explain the goal: test the `MergeNodes` class in Ssurgeon. Notes that MergeNodes is designed to combine two words where one is the head of a phrase, and dependent words can't have extra edges in or out of the subgraph. Two versions of the code are described.

**Cells 2–4 — Environment Setup**
Identical to Notebook 1: install Java 11, download CoreNLP 4.5.5, download English models, set classpath (with the same non-functional `!export` issue).

**Cell 5 — Verify MergeNodes Class**
Same as Notebook 1: confirms `MergeNodes.class` exists in the JAR.

**Cell 6 — Cross-Sentence Semgrex Test (`SemgrexMultiSentenceTest.java`)**

Tests whether Semgrex can match patterns across sentence boundaries using the text: *"John bought a new laptop. He loves using it for work."*

Three approaches are tested:

1. **Direct cross-sentence pattern** — Tries to write a single Semgrex pattern spanning both sentences. **Result:** Fails (Semgrex operates on single-sentence graphs).
2. **Coreference chains** — Uses CoreNLP's coreference annotator to link "John" ↔ "He" and "laptop" ↔ "it". **Result:** Successfully identifies coreference chains: `CHAIN2-["John" in sentence 1, "He" in sentence 2]` and `CHAIN3-["a new laptop" in sentence 1, "it" in sentence 2]`.
3. **Individual sentence patterns** — Matches patterns within each sentence independently. **Result:** The patterns compile but don't find matches because the pattern syntax is incorrect (uses `>nsubj` in the wrong direction — in Universal Dependencies, the verb is the governor, but the patterns assume the subject is the governor).

**Key finding:** Semgrex is **single-sentence only**. To match across sentences, you need coreference resolution as a separate step and then manually link the results.

**Cells 7–10 — Documentation Comments**
Detailed explanation of the merge goal and the Semgrex pattern used:
```
{}=gov >obj ({word:cream}=node1 >compound {word:ice}=node2)
```
This matches: any word (`gov`) that has an object relation to "cream" (`node1`), where "cream" has a compound relation to "ice" (`node2`).

**Cell 11 — Version 1: `SsurgeonMergeNodesComparison.java`**

The main experiment. This cell contains a Java program with TWO approaches to merging "ice" and "cream":

**Approach A — Ssurgeon MergeNodes (`testSsurgeonMergeNodes`):**
1. Compiles the Semgrex pattern and finds the match (governor = "likes", node1 = "cream", node2 = "ice").
2. Creates a `SsurgeonPattern` with the Semgrex pattern.
3. Creates a `MergeNodes` edit with the words to merge and an empty attributes map.
4. Adds the edit to the pattern and calls `surgeonPattern.execute(graph)`.
5. Checks if the result contains a merged node.

**Result:** The Ssurgeon operation claims success, but the **graph remains unchanged**. The merged node "creamice" is not found. The graph still shows the original "ice" and "cream" as separate nodes. After some post-processing attempted by the code, the final graph has `null` nodes instead of properly merged ones:
```
compound(null-5, null-4)
obj(likes-3, null-5)
```

**Approach B — Manual Merge (`testManualMerge`):**
1. Same pattern match.
2. Manually creates a new `IndexedWord` called "creamice" at the same index as "cream".
3. Transfers the `obj` edge from "cream" to "creamice".
4. Removes the old edges and marks old nodes as inactive (sets value to null).

**Result:** The manual merge partially works — "creamice" appears in the graph, but the old nodes aren't fully removed (they become null-valued ghosts):
```
compound(creamice-5, null-4)
obj(likes-3, creamice-5)
```

**Cells 12–13 — Observations from Version 1**
Documents that: the Ssurgeon MergeNodes operation doesn't change the graph structure; the original nodes persist; and null nodes appear in both approaches, indicating issues with node removal in the SemanticGraph API.

**Cells 14–15 — Documentation for Version 2**
Explains that Version 2 tries a different approach: using `evaluate()` instead of `execute()`, and passing a POS tag attribute (`pos: "NN"`) to guide the merge.

**Cell 16 — Version 2: `SsurgeonMergeNodes.java`**

Simplified test focusing only on the Ssurgeon approach:
1. Same Semgrex pattern, same sentence.
2. Creates MergeNodes with `attributes.put("pos", "NN")`.
3. Calls `mergeNodesEdit.evaluate(graph, matcher)` directly instead of going through `surgeonPattern.execute()`.

**Result:** `evaluate()` returns `false` — the merge operation explicitly reports failure. The graph is completely unchanged. The node at index 5 remains "cream/NN".

**Cells 17–18 — Final Observations**
Concludes that the Ssurgeon MergeNodes operation is **not functioning as expected** despite correctly identifying the nodes to merge. The API either silently fails or returns false.

### 4.4 How to Make It Work

1. **Platform:** Kaggle notebook environment.
2. **Requirements:** Same as Notebook 1 — internet, 2 GB+ RAM, ~1 GB disk.
3. **Run order:** Cells 0 through 18 sequentially. Cells 2–3 take several minutes.
4. **The MergeNodes issue:** As of CoreNLP 4.5.5, the `MergeNodes` class appears to have a bug or requires a very specific invocation pattern not documented in the public API. The constructor `new MergeNodes(List<String>, Map<String,String>)` is the one used here, but the internal implementation may require the nodes to be passed differently (e.g., as named node references from the Semgrex match rather than raw word strings). The CoreNLP source code on GitHub would be the next place to investigate.

---

## 5. Notebook 3: `ssurgeon-addedge.xpynb` — AddEdge (Empty)

### 5.1 Status: EMPTY FILE (0 bytes)

The file `ssurgeon-addedge.xpynb` is **0 bytes** — it contains no content. The `.xpynb` extension is non-standard (Jupyter notebooks use `.ipynb`), which may indicate a failed download, an export error, or a placeholder that was never populated.

### 5.2 What It Was Likely Intended to Do

Based on the filename and the pattern of the other notebooks, this was intended to test the **Ssurgeon `AddEdge` operation**, which adds a new grammatical relation (dependency edge) between two existing nodes in a dependency graph. For example, adding a `nmod` relation between two nouns that the parser missed.

### 5.3 How AddEdge Works (Conceptual)

```java
// Pseudocode for what this notebook would have tested:
SsurgeonEdit addEdge = new AddEdge(govNodeName, depNodeName, relationName);
// e.g., add an "amod" edge from "dress" to "red" if the parser missed it
```

---

## 6. Notebook 4: `ssurgeon-addnode.xpynb` — AddNode (Empty)

### 6.1 Status: EMPTY FILE (0 bytes)

The file `ssurgeon-addnode.xpynb` is also **0 bytes** with the same non-standard `.xpynb` extension.

### 6.2 What It Was Likely Intended to Do

This was intended to test the **Ssurgeon `AddNode` operation**, which inserts a completely new word node into an existing dependency graph. Use cases include inserting implied words (e.g., adding an elided verb) or augmenting parse trees for downstream processing.

---

## 7. Environment & Setup (Common to All Notebooks)

### 7.1 Platform

All notebooks are designed to run on **Kaggle** (kaggle.com). They use Kaggle-specific paths (`/kaggle/input/`, `/kaggle/working/`, `/kaggle/temp/`).

### 7.2 System Requirements

| Requirement | Specification |
|-------------|--------------|
| Runtime | Kaggle Notebook (Python 3, Linux) |
| Java | OpenJDK 11 (installed via apt-get) |
| Disk | ~1.5 GB (CoreNLP ZIP + models JAR + extracted files) |
| RAM | 2 GB minimum (CoreNLP pipeline is memory-intensive) |
| Internet | Required for downloading CoreNLP and models |
| GPU | Not required |

### 7.3 Dependencies Downloaded at Runtime

| File | Size | URL |
|------|------|-----|
| `stanford-corenlp-4.5.5.zip` | ~482 MB | https://nlp.stanford.edu/software/stanford-corenlp-4.5.5.zip |
| `stanford-corenlp-4.5.5-models-english.jar` | ~424 MB | http://nlp.stanford.edu/software/stanford-corenlp-4.5.5-models-english.jar |

### 7.4 Step-by-Step Setup (If Reproducing Locally)

1. Install Java 11+: `apt-get install openjdk-11-jdk-headless` (Linux) or download from adoptium.net.
2. Download and unzip CoreNLP 4.5.5.
3. Download the English models JAR.
4. Set classpath: `export CLASSPATH=./stanford-corenlp-4.5.5/*:./stanford-corenlp-4.5.5-models-english.jar`
5. Copy the Java code from the notebook cells into `.java` files.
6. Compile: `javac -cp "$CLASSPATH:." YourFile.java`
7. Run: `java -cp "$CLASSPATH:." YourFile`

### 7.5 Key Java Imports Used

```java
import edu.stanford.nlp.pipeline.*;          // CoreNLP pipeline
import edu.stanford.nlp.semgraph.*;          // SemanticGraph (dependency graphs)
import edu.stanford.nlp.semgraph.semgrex.*;  // Semgrex pattern matching
import edu.stanford.nlp.semgraph.semgrex.ssurgeon.*;  // Ssurgeon graph editing
import edu.stanford.nlp.ling.*;              // IndexedWord, CoreAnnotations
import edu.stanford.nlp.util.*;             // CoreMap, etc.
import edu.stanford.nlp.coref.data.CorefChain;  // Coreference (Notebook 2 only)
```

---

## 8. Key Findings & Takeaways

### 8.1 Semgrex Works Well for Single-Sentence Pattern Matching
Semgrex correctly identifies dependency patterns within individual sentences. The pattern compilation, matching, and node extraction all work as documented.

### 8.2 Semgrex Cannot Match Across Sentences
Semgrex operates on a per-sentence `SemanticGraph`. Cross-sentence matching requires coreference resolution as a separate step, followed by manual linking of results.

### 8.3 Ssurgeon MergeNodes Is Broken (or Underdocumented) in CoreNLP 4.5.5
Both `execute()` and `evaluate()` fail to actually merge nodes. The `execute()` method claims success but leaves the graph unchanged. The `evaluate()` method returns `false`. This is the central finding of Notebook 2.

### 8.4 Manual Graph Manipulation Is a Viable Workaround
Directly using the `SemanticGraph` API to add nodes, transfer edges, and remove old nodes partially works, though the removed nodes leave behind null-valued ghosts in the graph.

### 8.5 Fashion Search Patterns Need Refinement
The Semgrex patterns in Notebook 1 are well-structured but fail because they don't account for all dependency relation variants (`obl:to` vs `obl:for`) and don't aggregate results across multiple pattern matches.

---

## 9. Troubleshooting & Common Issues

### 9.1 "CLASSPATH not set" or "ClassNotFoundException"
The `!export CLASSPATH=...` cell in Jupyter doesn't persist. Fix: pass the classpath directly in the `subprocess.run()` call via the `-cp` flag, which is what the code already does correctly.

### 9.2 Java Compilation Errors
If you see errors about missing classes, ensure both the CoreNLP JARs directory (`stanford-corenlp-4.5.5/*`) AND the English models JAR are on the classpath.

### 9.3 Out of Memory
CoreNLP is memory-heavy. If you get `OutOfMemoryError`, add `-Xmx2g` to the Java run command:
```bash
java -Xmx2g -cp "..." YourClass
```

### 9.4 Slow Execution
The first run takes 2–5 minutes because CoreNLP loads large model files (POS tagger, dependency parser, NER models). Subsequent sentences parse in milliseconds.

### 9.5 Empty .xpynb Files
The `ssurgeon-addedge.xpynb` and `ssurgeon-addnode.xpynb` files are 0 bytes. They cannot be opened or executed. Re-export or re-download them from the source. The `.xpynb` extension suggests they may not have been saved correctly as Jupyter notebooks (which use `.ipynb`).

---

*Documentation generated from notebook analysis. Last reviewed: March 2026.*
