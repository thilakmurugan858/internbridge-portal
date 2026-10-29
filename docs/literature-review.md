# Literature Review: Intelligent Talent Discovery & Platform Integrity

## 1. Executive Summary

Online recruitment platforms connecting collegiate candidates with internship providers face three intertwined architectural and socio-technical hurdles:
1. **Information Asymmetry & Recruitment Fraud:** Students are particularly vulnerable to scams, illegitimate training fees, and deceptive stipend disclosures (Vidros et al., 2017).
2. **Vocabulary Mismatch in Skill Search:** Early-career resumes describe coursework or projects with divergent terminology compared to formal employer requisitions (Bian et al., 2019; Qin et al., 2020).
3. **Algorithmic Ranking Bias:** Unfiltered sorting by candidate velocity or historical hiring outcomes can unfairly disadvantage non-traditional students (Geyik et al., 2019).

This review investigates foundational methodologies proposed in academic literature, analyzes their architectural limitations, and delineates the concrete features implemented within InternBridge.

---

## 2. Analysis of Core Literature

### 2.1 Online Recruitment Fraud (ORF) Detection (Vidros et al., 2017)
- **Problem Statement:** The expansion of online hiring portals created opportunities for bad actors to harvest sensitive student identity documents (national IDs, bank numbers) or solicit fee deposits under the guise of "training programs".
- **Methodology & Key Insight:** Vidros et al. curated the EMSCAD benchmark (17,880 listings) and showed that legitimate postings exhibit rich verifiable attributes (corporate web domains, registered company metadata, specific workplace addresses), whereas fraudulent postings concentrate high-variance linguistic triggers and lack verifiable organizational profiles.
- **Limitations:** Machine learning classifiers alone produce false positives when legitimate early-stage startups lack extensive digital footprints.
- **InternBridge Implementation:** Rather than relying exclusively on automated black-box scoring, InternBridge enforces:
  - Required corporate entity relations for all employer profiles (`Company` model linked to `EmployerProfile`).
  - Strict input validation prohibiting ambiguous stipend structures.
  - An in-app Community Reporting system (`/api/reports` & `ListingReport` model) linked to an administrative moderation dashboard (`/api/admin/reports`) allowing rapid warning issuance or listing disabling.

### 2.2 Semantic Skill Matching vs. Lexical Overlap (Qin et al., 2020; Bian et al., 2019)
- **Problem Statement:** Standard boolean keyword queries frequently exclude qualified collegiate candidates who list equivalent technologies (e.g., listing `Next.js` and `TypeScript` without explicitly writing `Frontend Web Developer`).
- **Methodology & Key Insight:** Both Bian et al. and Qin et al. proved that decomposing job postings and candidate profiles into discrete, normalized skill taxonomies produces substantially more reliable candidate shortlisting than unstructured full-text vector embeddings.
- **InternBridge Implementation:**
  - Standardized atomic skill tagging arrays in both `Internship` and `StudentProfile` models.
  - Multi-facet database compound indexing on text fields, skills, categories, and work modes.
  - Search queries in `internshipController.ts` simultaneously match titles, categories, and skill arrays via `$or` regex and indexed queries.

### 2.3 Ranking Transparency & Candidate Agency (Geyik et al., 2019)
- **Problem Statement:** Algorithmic ranking engines frequently operate as opaque black boxes, leaving candidates without feedback or understanding of their application status.
- **Methodology & Key Insight:** Geyik et al. emphasized that candidate satisfaction and system fairness depend heavily on transparency and auditable stage transitions.
- **InternBridge Implementation:**
  - Transparent application stage progression: `applied` &rarr; `in_review` &rarr; `shortlisted` &rarr; `accepted` / `rejected`.
  - Recruiter audit trails with stage transition timestamps and hiring notes recorded in `statusHistory`.
  - Candidate withdrawal capability preventing trapped applications.

---

## 3. Comparison of Theoretical Models vs. InternBridge Engineering

| Theoretical Research Concept | Research Papers | Practical Real-World Constraint | InternBridge Engineered Solution |
| :--- | :--- | :--- | :--- |
| ORF Automated Classifier | Vidros et al. (2017) | Pure ML yields false positives on new startups | Entity verification workflow + user reporting pipeline + administrative moderation console |
| Deep Graph Resume Matching | Bian et al. (2019) | High inference latency, cold-start latency on students | Atomic skill array indexing + faceted multi-criteria query planner |
| Fairness-Constrained Re-Ranking | Geyik et al. (2019) | Complex optimization overhead | Explicit, deterministic filtering (location, work mode, stipend) without opaque bias filters |
| Auditable State Transitions | Geyik et al. (2019) | Real-time state synchronization | Atomic MongoDB compound index uniqueness + auditable status history |

---

## 4. References Cited
- Bian, S., Chen, X., Zhao, W. X., Zhou, K., Hou, Y., & Wen, J.-R. (2019). Learning to Match Jobs with Resumes via Manifold-Aware Deep Recommendation. *Proceedings of CIKM '19*, 10.1145/3357384.3357948.
- Geyik, S. C., Ambler, S., & Kenthapadi, K. (2019). Fairness-Aware Ranking in Search & Recommendation Systems with Application to LinkedIn Talent Search. *Proceedings of KDD '19*, 10.1145/3292500.3330691.
- Qin, C., Zhu, H., Zhu, C., Xu, T., Zhuang, F., Ma, C., & Chen, E. (2020). DRec: A Deep Learning Framework for Job-Resume Matching Based on Multi-Task and Skill Representation. *ACM Transactions on Information Systems*, 10.1145/3371408.
- Vidros, S., Kolias, C., Kambourakis, G., & Akoglu, L. (2017). Automatic Detection of Online Recruitment Fraud: Characteristics, Methods, and a Public Dataset. *Future Internet*, 9(1), 6. 10.3390/fi9010006.
