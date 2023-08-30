import pandas as pd
import json
import sys
import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest
import os

def clean_missing_values(dataframe, option):
    method = option.get('name')
    parameters = option.get('parameters', {})

    if method == 'Fill with specific value':
        value = parameters[0].get('value', 0)  # default to 0 if no value provided
        dataframe.fillna(value, inplace=True)
    elif method == 'Forward Fill':
        dataframe.fillna(method='ffill', inplace=True)
    elif method == 'Backward Fill':
        dataframe.fillna(method='bfill', inplace=True)
    elif method == 'Interpolate':
        order = parameters.get('order', 1)  # default linear interpolation
        dataframe.interpolate(method='polynomial', order=order, inplace=True)

    return dataframe

def handle_outliers(dataframe, option):
    # Implementation for outliers based on Z-score, IQR, isolation forest.
    method = option.get('name')
    parameters = option.get('parameters', {})

    if method == 'Z-Score':
        threshold = parameters.get('threshold', 3)
        dataframe = dataframe[(np.abs(stats.zscore(dataframe)) < threshold).all(axis=1)]
    elif method == 'IQR':
        q1 = dataframe.quantile(0.25)
        q3 = dataframe.quantile(0.75)
        iqr = q3 - q1
        dataframe = dataframe[~((dataframe < (q1 - 1.5 * iqr)) | (dataframe > (q3 + 1.5 * iqr))).any(axis=1)]
    elif method == 'Isolation Forest':
        contamination = parameters.get('contamination', 0.1)
        dataframe = dataframe[IsolationForest(contamination=contamination).fit_predict(dataframe) != -1]

    return dataframe

def handle_noise(dataframe, option):
    method = option.get('name')
    parameters = option.get('parameters', {})

    if method == 'Moving Average':
        window_size = parameters.get('window_size', 3)
        dataframe = dataframe.rolling(window=window_size).mean()
    elif method == 'Exponential Smoothing':
        smoothing_level = parameters.get('smoothing_level', 0.2)
        dataframe = dataframe.ewm(alpha=smoothing_level).mean()

    # ... You can continue with other methods 

    return dataframe

def normalize_data(dataframe, option):
    method = option.get('name')
    # Since these normalization methods you provided earlier don't require parameters, you can simply apply them

    if method == 'Min-Max':
        dataframe = (dataframe - dataframe.min()) / (dataframe.max() - dataframe.min())
    elif method == 'Z-Score':
        dataframe = (dataframe - dataframe.mean()) / dataframe.std()
    elif method == 'Decimal Scaling':
        max_abs_val = dataframe.abs().max()
        num_digits = len(str(int(max_abs_val)))
        dataframe = dataframe / (10 ** num_digits)

    return dataframe

def preprocess_data(file_path, options):
    df = pd.read_csv(file_path)

    for option in options:
        operation_name = option.get('operationName')

        if operation_name == 'Clean Missing Values':
            df = clean_missing_values(df, option)
        elif operation_name == 'Handle Outliers':
            df = handle_outliers(df, option)
        elif operation_name == 'Handle Noise':
            df = handle_noise(df, option)
        elif operation_name == 'Normalize Data':
            df = normalize_data(df, option)
        # ... continue with other operations

    return df

if __name__ == "__main__":
    file_path = sys.argv[1]
    selected_options_json = sys.argv[2]
    selected_options = json.loads(selected_options_json)

    # Define the directory where you want to save the output
    output_directory = "C:\\Users\\Labor\\ai_app_storage\\"
    
    # Construct the output file path
    # Here I'm assuming you want to keep the same filename but add a "_processed" suffix
    output_filename = os.path.basename(file_path).replace('.csv', '_processed.csv')
    output_file_path = os.path.join(output_directory, output_filename)

    result_df = preprocess_data(file_path, selected_options)
    
    # Save the processed dataframe to the specified path
    result_df.to_csv(output_file_path, index=False)

    print(f"Processed data saved to {output_file_path}")