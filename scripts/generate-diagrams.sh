#!/bin/bash
# Generate all .puml diagrams in /diagrams as PNG at 2x resolution
for f in diagrams/*.puml; do
  plantuml -DPLANTUML_LIMIT_SIZE=8192 -tpng -o . -scale 8 "$f"
done
