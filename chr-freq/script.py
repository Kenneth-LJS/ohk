import os
import json

corpus_dir = 'OANC-GrAF'

character_counts = {}

txt_file_paths = []
for subdir, dirs, files in os.walk(corpus_dir):
    for f in files:
        file_path = os.path.join(subdir, f)

        if os.path.splitext(file_path)[1] == '.txt':
            txt_file_paths.append(file_path)

for file_path in txt_file_paths:
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f.read().split('\n'):
            for char in line.strip():
                if char not in character_counts:
                    character_counts[char] = 1
                else:
                    character_counts[char] += 1

with open('raw-count.json', 'w', encoding='utf-8') as f:
    json.dump(character_counts, f, indent=4)

total_char_count = 0
for char, count in character_counts.items():
    total_char_count += count

character_proportion = []
for char, count in character_counts.items():
    character_proportion.append([char, count / total_char_count])
    character_proportion.sort(key=lambda x: x[1], reverse=True)

with open('percentages.txt', 'w', encoding='utf-8') as f:
    for char, proportion in character_proportion:

        f.write(f'"{char}" ({ord(char)})\t{proportion * 100:.2f}%\n')