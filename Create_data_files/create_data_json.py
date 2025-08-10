import pandas as pd
import json
import re
from typing import List, Dict

def matrix_to_json(excel_file_path, sheet_name=None, output_file_path=None):
    df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=1, index_col=None)

    df = df.iloc[1:, 1:].copy()


    matrix_json = {}

    for col in df.columns:
        clean_list = []
        for v in df[col].tolist():
            if pd.notna(v):  # skip NaN
                # Convert float integers like 2000.0 -> 2000
                if isinstance(v, float) and v.is_integer():
                    clean_list.append(int(v))
                else:
                    clean_list.append(v)
        matrix_json[col] = clean_list

    with open(output_file_path, "w", encoding="utf-8") as f:
        json.dump(matrix_json, f, indent=4, ensure_ascii=False)

    print("JSON saved to enhanced_matrix.json")


def excel_to_json(excel_file_path, sheet_name=None, output_file_path=None):
    """
    Convert Excel data to JSON format where each row becomes an object
    
    Parameters:
    excel_file_path: Path to your Excel file
    sheet_name: Name of the sheet (optional, uses first sheet if None)
    output_file_path: Path to save JSON file (optional, returns JSON string if None)
    """
    
    # Read Excel without header, so rows are just data
    if sheet_name is None:
        df = pd.read_excel(excel_file_path, sheet_name=0, header=None)
    else:
        df = pd.read_excel(excel_file_path, sheet_name=sheet_name, header=None)

    # Set second row (index 1) as header
    df.columns = df.iloc[1, :]
    
    # Drop first two rows (original header + new header row) and keep data from row 3 onwards
    df = df.iloc[2:, :].copy()

    # Optional: reset index if you want
    df.reset_index(drop=True, inplace=True)

    # Fill NaN with empty string
    df = df.fillna('')
    # Convert to list of dicts
    json_data = df.to_dict('records')

    # Save or return JSON
    if output_file_path:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        print(f"JSON data saved to {output_file_path}")
    else:
        return json.dumps(json_data, indent=2, ensure_ascii=False)
    
def expand_range(token: str) -> List[str]:
    """
    Expand a numeric range like '10010-10013' → ['10010', '10011', '10012', '10013'].
    If `token` is a single ID, return it unchanged.
    """
    token = token.strip()
    if "-" in token:
        lo, hi = map(int, token.split("-", 1))
        return [str(i) for i in range(lo, hi + 1)]
    return [token]


def parse_subprocess_cell(cell) -> List[str]:
    """
    Split a cell such as '10010-10012,10020;10030' into a flat list of IDs.
    Handles commas (,), semicolons (;), or line-breaks as separators.
    """
    if pd.isna(cell) or str(cell).strip() == "":
        return []

    ids = []
    # split on comma, semicolon or newline
    for part in re.split(r"[,\n;]", str(cell)):
        ids.extend(expand_range(part))
    return [x for x in ids if x]       # drop empty strings



def build_hauptprozess_json(df_process: pd.DataFrame,
                            col_id: str = "Prozessnummer",
                            col_art: str = "Prozessart",
                            col_links: str = "Verknüpfungen Prozessebene"
                            ) -> Dict[str, List[str]]:
    """
    Parameters
    ----------
    df_process : DataFrame
        The process table loaded from Excel.
    col_*      : str
        Column names to use (override if yours differ).

    Returns
    -------
    dict
        {Hauptprozess_ID: [subprocess_ids, ...], ...}
    """

    # Ensure IDs are strings (avoids 1 ≠ '1' mismatches)
    df_process[col_id] = df_process[col_id].astype(str).str.replace(r"\.0+$", "", regex=True)

    # Filter Hauptprozess rows
    df_haupt = df_process[df_process[col_art].str.lower() == "hauptprozess"]

    result = {}
    for _, row in df_haupt.iterrows():
        hp_id = row[col_id]
        subprocesses = parse_subprocess_cell(row[col_links])
        result[hp_id] = subprocesses            # empty list if none found
    return result


# Example usage:
if __name__ == "__main__":
    # Replace with your actual file path
    excel_file = "Challenge 2_Bibliothek und Baukasten.xlsx"
    matrix_path = "Enhanced_Challenge_2_Results.xlsx"
    
    # Convert to JSON
    excel_to_json(excel_file, output_file_path="process_data.json", sheet_name="Lösungsbibliothek")
    excel_to_json(excel_file, output_file_path="component_data.json", sheet_name="Baukasten")
    matrix_to_json(matrix_path, output_file_path="enhanced_matrix.json", sheet_name="Enhanced-Filled-Matrix")
    # Print first few records to verify
    print("Done")


    df_process = pd.read_excel(excel_file, sheet_name="Lösungsbibliothek", header=None).fillna("")
    # Set second row (index 1) as header
    df_process.columns = df_process.iloc[1, :]
    
    # Drop first two rows (original header + new header row) and keep data from row 3 onwards
    df_process = df_process.iloc[2:, :].copy()

    # Optional: reset index if you want
    df_process.reset_index(drop=True, inplace=True)

    haupt_to_sub = build_hauptprozess_json(df_process)

    # Write to JSON file
    with open("hauptprozess_map.json", "w", encoding="utf-8") as f:
        json.dump(haupt_to_sub, f, indent=4, ensure_ascii=False)

    print("JSON saved to hauptprozess_map.json")




