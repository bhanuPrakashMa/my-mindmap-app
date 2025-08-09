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







# import json
# import os

# def load_json_file(file_path):
#     try:
#         with open(file_path, 'r') as f:
#             return json.load(f)
#     except FileNotFoundError:
#         print(f"Error: File '{file_path}' not found.")
#         return None
#     except json.JSONDecodeError:
#         print(f"Error: File '{file_path}' contains invalid JSON.")
#         return None

# # Define file paths
# base_path = 'e:/chall_dehn/final/my-mindmap-app'
# files = {
#     'hauptprozess_map': f'{base_path}/hauptprozess_map.json',
#     'enhanced_matrix': f'{base_path}/enhanced_matrix.json',
#     'process_data': f'{base_path}/process_data.json',
#     'component_data': f'{base_path}/component_data.json'
# }

# # Load JSON files
# hauptprozess_map = load_json_file(files['hauptprozess_map'])
# enhanced_matrix = load_json_file(files['enhanced_matrix'])
# process_data = load_json_file(files['process_data'])
# component_data = load_json_file(files['component_data'])

# # Check if all files loaded successfully
# if not all([hauptprozess_map, enhanced_matrix, process_data, component_data]):
#     print("Exiting due to missing or invalid input files.")
#     exit(1)

# # Create lookup dictionaries
# process_lookup = {str(int(p['Prozessnummer'])): p['Prozessname'] for p in process_data if p['Prozessnummer']}
# component_lookup = {str(c['Lfd. Nummer']): c['Bauteilnamen'] for c in component_data if c['Lfd. Nummer']}

# # Initialize output
# output = []

# # Build hierarchy
# for process_id, partial_solution_ids in hauptprozess_map.items():
#     process_name = process_lookup.get(process_id, f"Process {process_id}")
#     process_entry = {
#         "id": f"Process_{process_id}",
#         "title": process_name,
#         "data": {
#             "name": process_id,
#             "children": []
#         }
#     }
    
#     for ps_id in partial_solution_ids:
#         ps_name = process_lookup.get(ps_id, f"Partial Solution {ps_id}")
#         ps_entry = {
#             "name": f"Phase: {ps_id} - {ps_name}",
#             "children": []
#         }
#         building_blocks = enhanced_matrix.get(ps_id, [])
#         for bb_id in building_blocks:
#             bb_name = component_lookup.get(str(bb_id), f"Component {bb_id}")
#             ps_entry["children"].append({"name": f"{bb_id} - {bb_name}"})
#         process_entry["data"]["children"].append(ps_entry)
    
#     if not partial_solution_ids and process_id in enhanced_matrix and enhanced_matrix[process_id]:
#         process_entry["data"]["children"] = [{
#             "name": f"Direct Components for {process_id}",
#             "children": [
#                 {"name": f"{bb_id} - {component_lookup.get(str(bb_id), f'Component {bb_id}')}"}
#                 for bb_id in enhanced_matrix[process_id]
#             ]
#         }]
    
#     output.append(process_entry)

# # Save output
# output_path = f'{base_path}/process_mapping_output.json'
# try:
#     with open(output_path, 'w') as f:
#         json.dump(output, f, indent=2)
#     # print(f"Generated {output_path}")
# except Exception as e:
#     print(f"Error writing output file: {e}")
# print(json.dumps(output, indent=2))  # Print output for verification




import json
import sys
import os

def load_json_file(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: File '{file_path}' contains invalid JSON.", file=sys.stderr)
        sys.exit(1)

base_path = 'e:/chall_dehn/final/my-mindmap-app'
hauptprozess_map = load_json_file(f'{base_path}/hauptprozess_map.json')
enhanced_matrix = load_json_file(f'{base_path}/enhanced_matrix.json')
process_data = load_json_file(f'{base_path}/process_data.json')
component_data = load_json_file(f'{base_path}/component_data.json')


# import json
# import sys

# # Load input JSON files
# with open('hauptprozess_map.json', 'r') as f:
#     hauptprozess_map = json.load(f)

# with open('enhanced_matrix.json', 'r') as f:
#     enhanced_matrix = json.load(f)

# with open('process_data.json', 'r') as f:
#     process_data = json.load(f)

# with open('component_data.json', 'r') as f:
#     component_data = json.load(f)

# Create lookup dictionaries for process and component data
process_lookup = {
    str(int(p['Prozessnummer'])): {
        'name': p['Prozessname'],
        'Prozessart': p['Prozessart'],
        'Merkmalsklasse 1': p['Merkmalsklasse 1'],
        'Merkmalsklasse 2': p['Merkmalsklasse 2'],
        'Merkmalsklasse 3': p['Merkmalsklasse 3'],
        'Randbedingung 1': p['Randbedingung 1'],
        'Randbedingung 2': p['Randbedingung 2'],
        'Ablageort konstruktiv': p['Ablageort konstruktiv'],
        'Ablageort steuerungstechnisch': p['Ablageort steuerungstechnisch'],
        # 'Ablageort prüftechnisch': p['Ablageort prüftechnisch'],
        'Ablageort robotertechnisch': p['Ablageort robotertechnisch']
    } for p in process_data if p['Prozessnummer']
}

component_lookup = {
    str(c['Lfd. Nummer']): {
        'name': c['Bauteilnamen'],
        'Bauteilkategorie': c['Bauteilkategorie'],
        'Hersteller': c['Hersteller'],
        'Typ': c['Typ'],
        'Eigenschaft 1': c['Eigenschaft 1'],
        'Wert 1': c['Wert 1'],
        'Eigenschaft 2': c['Eigenschaft 2'],
        'Wert 2': c['Wert 2'],
        'Eigenschaft 3': c['Eigenschaft 3'],
        'Wert 3': c['Wert 3'],
        'Ablageort konstruktiv': c['Ablageort konstruktiv'],
        'Ablageort steuerungstechnisch': c['Ablageort steuerungstechnisch'],
        # 'Ablageort prüftechnisch': c['Ablageort prüftechnisch'],
        'Ablageort robotertechnisch': c['Ablageort robotertechnisch']
    } for c in component_data if c['Lfd. Nummer']
}

# Initialize output list
output = []

# Iterate through hauptprozess_map to build the hierarchy
for process_id, partial_solution_ids in hauptprozess_map.items():
    process_info = process_lookup.get(process_id, {
        'name': f"Process {process_id}",
        'Prozessart': '',
        'Merkmalsklasse 1': '',
        'Merkmalsklasse 2': '',
        'Merkmalsklasse 3': '',
        'Randbedingung 1': '',
        'Randbedingung 2': '',
        'Ablageort konstruktiv': '',
        'Ablageort steuerungstechnisch': '',
        # 'Ablageort prüftechnisch': '',
        'Ablageort robotertechnisch': ''
    })
    
    # Initialize process entry
    process_entry = {
        "id": f"Process_{process_id}",
        "title": process_info['name'],
        "data": {
            "name": process_id,
            "attributes": {
                "Prozessart": process_info['Prozessart'],
                "Merkmalsklasse 1": process_info['Merkmalsklasse 1'],
                "Merkmalsklasse 2": process_info['Merkmalsklasse 2'],
                "Merkmalsklasse 3": process_info['Merkmalsklasse 3'],
                "Randbedingung 1": process_info['Randbedingung 1'],
                "Randbedingung 2": process_info['Randbedingung 2'],
                "Ablageort konstruktiv": process_info['Ablageort konstruktiv'],
                "Ablageort steuerungstechnisch": process_info['Ablageort steuerungstechnisch'],
                # "Ablageort prüftechnisch": process_info['Ablageort prüftechnisch'],
                "Ablageort robotertechnisch": process_info['Ablageort robotertechnisch']
            },
            "children": []
        }
    }
    
    # Add partial solutions (Level 2)
    for ps_id in partial_solution_ids:
        ps_info = process_lookup.get(ps_id, {
            'name': f"Partial Solution {ps_id}",
            'Prozessart': '',
            'Merkmalsklasse 1': '',
            'Merkmalsklasse 2': '',
            'Merkmalsklasse 3': '',
            'Randbedingung 1': '',
            'Randbedingung 2': '',
            'Ablageort konstruktiv': '',
            'Ablageort steuerungstechnisch': '',
            'Ablageort prüftechnisch': '',
            'Ablageort robotertechnisch': ''
        })
        ps_entry = {
            # "name": f"Phase: {ps_id} - {ps_info['name']}",
            "name": f"ID: {ps_id}",
            "attributes": {
                "Prozessart": ps_info['Prozessart'],
                "Merkmalsklasse 1": ps_info['Merkmalsklasse 1'],
                "Merkmalsklasse 2": ps_info['Merkmalsklasse 2'],
                "Merkmalsklasse 3": ps_info['Merkmalsklasse 3'],
                "Randbedingung 1": ps_info['Randbedingung 1'],
                "Randbedingung 2": ps_info['Randbedingung 2'],
                "Ablageort konstruktiv": ps_info['Ablageort konstruktiv'],
                "Ablageort steuerungstechnisch": ps_info['Ablageort steuerungstechnisch'],
                # "Ablageort prüftechnisch": ps_info['Ablageort prüftechnisch'],
                "Ablageort robotertechnisch": ps_info['Ablageort robotertechnisch']
            },
            "children": []
        }
        
        # Add building blocks (Level 3)
        building_blocks = enhanced_matrix.get(ps_id, [])
        for bb_id in building_blocks:
            bb_info = component_lookup.get(str(bb_id), {
                'name': f"Component {bb_id}",
                'Bauteilkategorie': '',
                'Hersteller': '',
                'Typ': '',
                'Eigenschaft 1': '',
                'Wert 1': '',
                'Eigenschaft 2': '',
                'Wert 2': '',
                'Eigenschaft 3': '',
                'Wert 3': '',
                'Ablageort konstruktiv': '',
                'Ablageort steuerungstechnisch': '',
                # 'Ablageort prüftechnisch': '',
                'Ablageort robotertechnisch': ''
            })
            ps_entry["children"].append({
                "name": f"{bb_id} - {bb_info['name']}",
                "attributes": {
                    "Bauteilkategorie": bb_info['Bauteilkategorie'],
                    "Hersteller": bb_info['Hersteller'],
                    "Typ": bb_info['Typ'],
                    "Eigenschaft 1": bb_info['Eigenschaft 1'],
                    "Wert 1": bb_info['Wert 1'],
                    "Eigenschaft 2": bb_info['Eigenschaft 2'],
                    "Wert 2": bb_info['Wert 2'],
                    "Eigenschaft 3": bb_info['Eigenschaft 3'],
                    "Wert 3": bb_info['Wert 3'],
                    "Ablageort konstruktiv": bb_info['Ablageort konstruktiv'],
                    "Ablageort steuerungstechnisch": bb_info['Ablageort steuerungstechnisch'],
                    # "Ablageort prüftechnisch": bb_info['Ablageort prüftechnisch'],
                    "Ablageort robotertechnisch": bb_info['Ablageort robotertechnisch']
                }
            })
        
        process_entry["data"]["children"].append(ps_entry)
    
    # Add processes with no partial solutions but with building blocks
    if not partial_solution_ids and process_id in enhanced_matrix and enhanced_matrix[process_id]:
        ps_entry = {
            "name": f"Direct Components for {process_id}",
            "attributes": {},
            "children": []
        }
        for bb_id in enhanced_matrix[process_id]:
            bb_info = component_lookup.get(str(bb_id), {
                'name': f"Component {bb_id}",
                'Bauteilkategorie': '',
                'Hersteller': '',
                'Typ': '',
                'Eigenschaft 1': '',
                'Wert 1': '',
                'Eigenschaft 2': '',
                'Wert 2': '',
                'Eigenschaft 3': '',
                'Wert 3': '',
                'Ablageort konstruktiv': '',
                'Ablageort steuerungstechnisch': '',
                # 'Ablageort prüftechnisch': '',
                'Ablageort robotertechnisch': ''
            })
            ps_entry["children"].append({
                "name": f"{bb_id} - {bb_info['name']}",
                "attributes": {
                    "Bauteilkategorie": bb_info['Bauteilkategorie'],
                    "Hersteller": bb_info['Hersteller'],
                    "Typ": bb_info['Typ'],
                    "Eigenschaft 1": bb_info['Eigenschaft 1'],
                    "Wert 1": bb_info['Wert 1'],
                    "Eigenschaft 2": bb_info['Eigenschaft 2'],
                    "Wert 2": bb_info['Wert 2'],
                    "Eigenschaft 3": bb_info['Eigenschaft 3'],
                    "Wert 3": bb_info['Wert 3'],
                    "Ablageort konstruktiv": bb_info['Ablageort konstruktiv'],
                    "Ablageort steuerungstechnisch": bb_info['Ablageort steuerungstechnisch'],
                    # "Ablageort prüftechnisch": bb_info['Ablageort prüftechnisch'],
                    "Ablageort robotertechnisch": bb_info['Ablageort robotertechnisch']
                }
            })
        process_entry["data"]["children"].append(ps_entry)
    
    output.append(process_entry)

# Output JSON to stdout
json.dump(output, sys.stdout, indent=2)