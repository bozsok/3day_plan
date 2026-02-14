
import re

try:
    with open('public/country.svg', 'r', encoding='utf-8') as f:
        content = f.read()

    print("--- RED ELEMENTS ---")
    # Search for fill="#ff0000" or fill="red"
    red_matches = re.findall(r'<[^>]*fill="(?:\#ff0000|red)"[^>]*>', content, re.IGNORECASE)
    for match in red_matches:
        print(match)

    print("\n--- GREEN ELEMENTS ---")
    # Search for fill="#00ff00" or fill="green" or similar vibrant greens
    green_matches = re.findall(r'<[^>]*fill="(?:\#00ff00|green|\#0f0)"[^>]*>', content, re.IGNORECASE)
    for match in green_matches:
        print(match)

    print("\n--- RECT ELEMENTS ---")
    # Search for <rect ... >
    rect_matches = re.findall(r'<rect[^>]*>', content, re.IGNORECASE)
    for match in rect_matches:
        print(match)
        
    print("\n--- SEARCHING FOR 'Nagyk' or 'Budapest' in raw content ---")
    if "Budapest" in content:
        print("Found strict 'Budapest'")
    if "Nagyk" in content:
        print("Found strict 'Nagyk'")

except Exception as e:
    print(f"Error: {e}")
