
import xml.etree.ElementTree as ET
import sys

try:
    tree = ET.parse('public/country.svg')
    root = tree.getroot()
    
    # helper to print concise info
    def print_elem(elem, level=0):
        indent = "  " * level
        elem_id = elem.get('id', '')
        elem_class = elem.get('class', '')
        tag = elem.tag.split('}')[-1] # strip namespace
        
        info = f"{indent}<{tag}"
        if elem_id: info += f" id='{elem_id}'"
        if elem_class: info += f" class='{elem_class}'"
        
        # Check for transforms on containers
        if 'transform' in elem.attrib:
             info += f" transform='{elem.attrib['transform'][:20]}...'"
             
        print(info + ">")
        
        # Don't recurse too deep if many children, just summary
        children = list(elem)
        path_count = sum(1 for c in children if c.tag.endswith('path'))
        rect_count = sum(1 for c in children if c.tag.endswith('rect'))
        
        if path_count > 0:
            print(f"{indent}  ... contains {path_count} paths")
        if rect_count > 0:
            print(f"{indent}  ... contains {rect_count} rects")
            # print specific rects of interest
            for c in children:
                if c.tag.endswith('rect') and ('sm_location' in c.get('class', '')):
                     print(f"{indent}    -> Found target rect: class='{c.get('class')}' transform='{c.get('transform')}'")

        # Recurse for groups
        for c in children:
            if c.tag.endswith('g'):
                print_elem(c, level + 1)

    print_elem(root)

except Exception as e:
    print(f"Error: {e}")
