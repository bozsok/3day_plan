
import re

try:
    with open('public/country.svg', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print("--- ORDER CHECK ---")
    first_path_line = -1
    budapest_line = -1
    nagykoros_line = -1
    
    for i, line in enumerate(lines):
        if '<path' in line and first_path_line == -1:
            first_path_line = i + 1
            print(f"First <path> found at line {i+1}")
            
        if 'sm_location_0' in line: # Budapest
            budapest_line = i + 1
            print(f"Budapest (sm_location_0) found at line {i+1}")
            
        if 'sm_location_1' in line: # Nagykőrös
            nagykoros_line = i + 1
            print(f"Nagykőrös (sm_location_1) found at line {i+1}")

    if budapest_line > 0 and first_path_line > 0:
        if budapest_line < first_path_line:
            print("RESULT: Budapest rect is BEFORE paths (likely covered)")
        else:
            print("RESULT: Budapest rect is AFTER paths (should be visible but check specific county order)")
            
except Exception as e:
    print(f"Error: {e}")
