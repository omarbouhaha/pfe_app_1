import pandas as pd
import sys
import json

def get_columns(file_path):
    df = pd.read_csv(file_path, nrows=1)  # read only the first row to get the column names
    return df.columns.tolist()

if __name__ == "__main__":
    file_path = sys.argv[1]
    columns = get_columns(file_path)
    print(json.dumps(columns))



