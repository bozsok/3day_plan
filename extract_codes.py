
import re
import sys

try:
    with open('public/country.svg', 'r', encoding='utf-8') as f:
        content = f.read()
        
    codes = set(re.findall(r'sm_state_([A-Z0-9]+)', content))
    print("Found codes:")
    for code in sorted(codes):
        print(code)
        
    # Also count paths without sm_state
    all_paths = len(re.findall(r'<path', content))
    classified_paths = len(re.findall(r'class="[^"]*sm_state', content))
    
    print(f"\nTotal paths: {all_paths}")
    print(f"Classified paths: {classified_paths}")
    
except Exception as e:
    print(f"Error: {e}")
