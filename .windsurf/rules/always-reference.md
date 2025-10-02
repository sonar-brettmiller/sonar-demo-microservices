---
trigger: always_on
---

"Load the SonarQube validation prompts from:
- /Users/brett.miller/Documents/SonarDemos/SQ-AI-Rules/AI-Rule-Generation/prompts/system_prompts/pre_generation.md
- /Users/brett.miller/Documents/SonarDemos/SQ-AI-Rules/AI-Rule-Generation/prompts/language_specific/python_sonar_guidelines.md

Then validate all code you generate against my SonarQube project '{{current-project}}'