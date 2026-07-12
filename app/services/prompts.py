# IBM Granite Prompt Templates for Academic Paper Synthesis
# Centralized and organized to avoid duplication, maintain determinism, and optimize for academic documents.

SUMMARY_PROMPT_TEMPLATE = """You are an elite academic research reviewer. Analyze the research paper titled "{title}".
Below is the full text or main excerpt of the paper.
Write a professional, academic, highly structured executive summary.

Provide your response in Markdown with these EXACT headings and structure:
### Overview
### Objectives
### Methodology
### Key Findings
### Conclusion

Here is the paper text:
---
{text}
---

Generate the summary in Markdown with the exact headings above:"""

QA_PROMPT_TEMPLATE = """You are a precise, scholarly research assistant. Answer the following question based ONLY on the provided context of the research paper.

CRITICAL RULES:
1. Answer the question using ONLY facts and direct details present in the context below.
2. Never hallucinate, invent details, or make assumptions not supported by the text.
3. Never invent citations.
4. If the answer to the question is not explicitly discussed or is absent from the provided context, you MUST respond EXACTLY with:
"The uploaded paper does not contain enough information to answer this question."
Do not add any preamble, conversational filler, or further explanation if the answer is absent.

Context:
---
{text}
---

Question: {question}

Scholarly, accurate response:"""

INSIGHTS_PROMPT_TEMPLATE = """You are a senior peer reviewer and academic strategist. Analyze the research paper titled "{title}".
Evaluate the text deep within its scientific contribution, methodology, and statements.

Provide your response in Markdown with these EXACT headings and structure:
### Research Gaps
### Limitations
### Future Work
### Novel Ideas
### Possible Improvements

Here is the paper text:
---
{text}
---

Generate the deep peer-review insights in Markdown with the exact headings above:"""
