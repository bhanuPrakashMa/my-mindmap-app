# import json

# # This is the data that would be generated or fetched by the Python script
# all_mind_maps = [
#     {
#         "id": "map1",
#         "title": "Project Planning",
#         "data": {
#             "name": "My Project",
#             "children": [
#                 {
#                     "name": "Phase 1: Research",
#                     "children": [
#                         { "name": "Competitor Analysis" },
#                         { "name": "Market Trends" },
#                         { "name": "User Interviews" }
#                     ]
#                 },
#                 {
#                     "name": "Phase 2: Design",
#                     "children": [
#                         { "name": "Wireframes" },
#                         { "name": "Mockups" },
#                         { "name": "Prototyping" }
#                     ]
#                 }
#             ]
#         }
#     },
#     {
#         "id": "map2",
#         "title": "Team Goals",
#         "data": {
#             "name": "Team Goals",
#             "children": [
#                 { "name": "Q3 Targets" },
#                 {
#                     "name": "New Features",
#                     "children": [
#                         { "name": "Feature A" },
#                         { "name": "Feature B" }
#                     ]
#                 },
#                 { "name": "Growth Strategy" }
#             ]
#         }
#     },
#     {
#         "id": "map3",
#         "title": "Product Launch",
#         "data": {
#             "name": "Product Launch",
#             "children": [
#                 { "name": "Marketing Plan" },
#                 { "name": "Release Schedule" },
#                 { "name": "Post-Launch Support" }
#             ]
#         }
#     }
# ]

# # Print the JSON data to standard output
# # This is crucial for the Node.js server to capture it
# print(json.dumps(all_mind_maps, indent=2))







import json
import os

def load_json_file(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: File '{file_path}' contains invalid JSON.")
        return None

# Define file paths
#base_path = 'e:/chall_dehn/final/my-mindmap-app'
base_path = os.path.dirname(os.path.abspath(__file__))


files = {
    'hauptprozess_map': f'{base_path}/hauptprozess_map.json',
    'enhanced_matrix': f'{base_path}/enhanced_matrix.json',
    'process_data': f'{base_path}/process_data.json',
    'component_data': f'{base_path}/component_data.json'
}

# Load JSON files
hauptprozess_map = load_json_file(files['hauptprozess_map'])
enhanced_matrix = load_json_file(files['enhanced_matrix'])
process_data = load_json_file(files['process_data'])
component_data = load_json_file(files['component_data'])

# Check if all files loaded successfully
if not all([hauptprozess_map, enhanced_matrix, process_data, component_data]):
    print("Exiting due to missing or invalid input files.")
    exit(1)

# Create lookup dictionaries
process_lookup = {str(int(p['Prozessnummer'])): p['Prozessname'] for p in process_data if p['Prozessnummer']}
component_lookup = {str(c['Lfd. Nummer']): c['Bauteilnamen'] for c in component_data if c['Lfd. Nummer']}

# Initialize output
output = []

# Build hierarchy
for process_id, partial_solution_ids in hauptprozess_map.items():
    process_name = process_lookup.get(process_id, f"Process {process_id}")
    process_entry = {
        "id": f"Process_{process_id}",
        "title": process_name,
        "data": {
            "name": process_id,
            "children": []
        }
    }
    
    for ps_id in partial_solution_ids:
        ps_name = process_lookup.get(ps_id, f"Partial Solution {ps_id}")
        ps_entry = {
            "name": f"id: {ps_id}",
            "Description": f"Des: {ps_name}",
            
            "children": []
        }
        building_blocks = enhanced_matrix.get(ps_id, [])
        for bb_id in building_blocks:
            bb_name = component_lookup.get(str(bb_id), f"Component {bb_id}")
            ps_entry["children"].append({"name": f"{bb_id} - {bb_name}"})
        process_entry["data"]["children"].append(ps_entry)
    
    if not partial_solution_ids and process_id in enhanced_matrix and enhanced_matrix[process_id]:
        process_entry["data"]["children"] = [{
            "name": f"Direct Components for {process_id}",
            "children": [
                {"name": f"{bb_id} - {component_lookup.get(str(bb_id), f'Component {bb_id}')}"}
                for bb_id in enhanced_matrix[process_id]
            ]
        }]
    
    output.append(process_entry)

# Save output
output_path = f'{base_path}/process_mapping_output.json'
try:
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    # print(f"Generated {output_path}")
except Exception as e:
    print(f"Error writing output file: {e}")
print(json.dumps(output, indent=2))  # Print output for verification