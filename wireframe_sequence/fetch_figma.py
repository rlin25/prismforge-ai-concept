#!/usr/bin/env python3
import requests
import json
import sys

def extract_frames(node):
    """
    Recursively extract frames, components, instances, and text layers
    """
    node_type = node.get("type")
    if node_type in ["FRAME", "COMPONENT", "INSTANCE", "TEXT"]:
        simplified_node = {
            "name": node.get("name"),
            "type": node_type,
            "absoluteBoundingBox": node.get("absoluteBoundingBox"),
            "children": []
        }

        # Include text content for text layers
        if node_type == "TEXT":
            simplified_node["characters"] = node.get("characters")
            simplified_node["style"] = node.get("style", {})  # font size, family, weight, color

        # Recurse into children
        if "children" in node:
            for child in node["children"]:
                extracted = extract_frames(child)
                if extracted:
                    simplified_node["children"].append(extracted)
        return simplified_node
    elif "children" in node:
        children = []
        for child in node["children"]:
            extracted = extract_frames(child)
            if extracted:
                children.append(extracted)
        if children:
            return {"children": children}
    return None

def main():
    # Read arguments
    if len(sys.argv) < 3:
        print("Usage: python fetch_figma.py <FIGMA_TOKEN> <FIGMA_FILE_KEY> [OUTPUT_FILENAME]")
        sys.exit(1)

    FIGMA_TOKEN = sys.argv[1]
    FILE_KEY = sys.argv[2]
    OUTPUT_FILE = sys.argv[3] if len(sys.argv) > 3 else "prismforge_simplified.json"

    url = f"https://api.figma.com/v1/files/{FILE_KEY}"
    headers = {"X-Figma-Token": FIGMA_TOKEN}

    # Fetch Figma file
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching Figma file: {response.status_code} {response.text}")
        sys.exit(1)

    figma_data = response.json()
    simplified = []

    document = figma_data.get("document", {})
    if "children" in document:
        for child in document["children"]:
            frame_data = extract_frames(child)
            if frame_data:
                simplified.append(frame_data)

    # Save simplified JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(simplified, f, ensure_ascii=False, indent=2)

    print(f"Simplified JSON saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

