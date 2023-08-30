import pandas as pd
import os
import sys
import json
import datetime
from sklearn.preprocessing import MinMaxScaler, StandardScaler, RobustScaler
import xgboost as xgb
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np
from sklearn.metrics import r2_score


def create_scaler(scaler_data):
    scaler_type = scaler_data["name"]
    parameters = scaler_data["parameters"]
    if scaler_type == "minmax":
        feature_range = tuple(parameters["feature_range"]["default"])
        return MinMaxScaler(feature_range=feature_range)
    elif scaler_type == "standard":
        with_mean = parameters["with_mean"]["default"]
        with_std = parameters["with_std"]["default"]
        return StandardScaler(with_mean=with_mean, with_std=with_std)
    elif scaler_type == "robust":
        quantile_range = tuple(parameters["quantile_range"]["default"])
        with_centering = parameters["with_centering"]["default"]
        with_scaling = parameters["with_scaling"]["default"]
        return RobustScaler(quantile_range=quantile_range, with_centering=with_centering, with_scaling=with_scaling)


def process_data(data):
    # Load the dataset into a pandas DataFrame
    df = pd.read_csv(data["selectedFile"]["path"])

    # Using a set to merge both lists and remove duplicates, and then converting it back to a list
    selected_columns = list(set([data["selectedOutputColumn"]] + list(data["selectedInputColumns"].keys())))
    # search for a column name in the df columns which contains date or time (case insensitive)
    date_time_columns = [col for col in df.columns if "date" in col.lower() or "time" in col.lower()]

    df_copy = df.copy()[date_time_columns+selected_columns]

    # Process each selected input column
    for column, config in data["selectedInputColumns"].items():
        prev_value = int(config["prevValue"])
        shift_value = int(config["shiftValue"])
        for i in range(shift_value, shift_value + prev_value):
            new_column_name = f"{column}(t-{i})"
            df_copy[new_column_name] = df_copy[column].shift(i)


    max_shift = max(int(input_columns["prevValue"]) + int(input_columns["shiftValue"]) for input_columns in data["selectedInputColumns"].values()) -1
    df_copy = df_copy.iloc[max_shift:]

    originaldf = df_copy.copy()

    # create a list from data["selectedInputColumns"].keys() and drop the column equal to data["selectedOutputColumn"] if it exists
    drop_columns = list(set(data["selectedInputColumns"].keys()) - set([data["selectedOutputColumn"]]))

    # Drop the original columns from the modified DataFrame
    df_copy.drop(columns=drop_columns, inplace=True) 

    # declare a list of the input columns, df_copy.columns - [data["selectedOutputColumn"]]
    input_columns = list(set(df_copy.columns) - set([data["selectedOutputColumn"]])- set(date_time_columns))
    output_column = data["selectedOutputColumn"]

    scaler1 = create_scaler(data["selectedScaler"])
    scaler2 = create_scaler(data["selectedScaler"])

    df_copy[input_columns] = scaler1.fit_transform(df_copy[input_columns])
    df_copy[[output_column]] = scaler2.fit_transform(df_copy[[output_column]])

    print("done processing data")
    return df_copy, scaler1, scaler2, date_time_columns, originaldf


def train_model(data, df, date_time_columns):
    output_column = data["selectedOutputColumn"]
    X = df.drop(columns=[output_column])
    X = X.drop(columns=date_time_columns)
    y = df[output_column]
    
    # Splitting the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    model_type = data["selectedModel"]
    form_model_data = data["formModelData"]

    if model_type == "xgboost":
        model = xgb.XGBRegressor(
            # n_estimators=form_model_data.get("n_estimators", 100),
            # learning_rate=form_model_data.get("learning_rate", 0.1),
            # max_depth=form_model_data.get("max_depth", 6),
            # subsample=form_model_data.get("subsample", 1.0),
            # colsample_bytree=form_model_data.get("colsample_bytree", 1.0),
            # objective=form_model_data.get("objective", "reg:squarederror")
        )

    elif model_type == "linear_regression":
        model = LinearRegression(
            fit_intercept=form_model_data.get("fit_intercept", True),
            # normalize=form_model_data.get("normalize", False)
        )

    elif model_type == "svr":
        model = SVR(
            C=form_model_data.get("C", 1.0),
            kernel=form_model_data.get("kernel", "rbf"),
            degree=form_model_data.get("degree", 3),
            gamma=form_model_data.get("gamma", "scale"),
            coef0=form_model_data.get("coef0", 0.0),
            shrinking=form_model_data.get("shrinking", True),
            epsilon=form_model_data.get("epsilon", 0.1)
        )

    elif model_type == "random_forest_regression":
        model = RandomForestRegressor(
            n_estimators=form_model_data.get("n_estimators", 100),
            max_depth=form_model_data.get("max_depth"),
            min_samples_split=form_model_data.get("min_samples_split", 2),
            min_samples_leaf=form_model_data.get("min_samples_leaf", 1),
            max_features=form_model_data.get("max_features", "auto"),
            bootstrap=form_model_data.get("bootstrap", True),
            oob_score=form_model_data.get("oob_score", False)
        )
    print("done creating model")
    # Train the model
    model.fit(X_train, y_train)
    print("done training model")

    # Getting predictions and computing the MSE for evaluation
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print("done predicting")
    
    print("r2_score", r2_score(y_test, y_pred))

    return model, mse, y_pred

def savePredictions(df, y_pred, scaler2, data):
    # reverse the scaling on y_pred
    y_pred = scaler2.inverse_transform(y_pred.reshape(-1,1))
    # add the predictions to the original dataframe at the end of the dataframe as a new column named "predictions" 
    n = len(y_pred)
    print(n)
    df['predictions'] = np.nan
    df.iloc[-n:, -1] = y_pred
    df = df.tail(n)
    print(df.columns)
    # delete the rows with missing values
    df = df.dropna()
    # save the dataframe to a csv file
    # Before saving the processed dataframe
    current_time_str = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    base_name, file_extension = os.path.splitext(data["selectedFile"]["name"])
    new_file_name = f"{base_name}_{current_time_str}{file_extension}"
    new_file_path = os.path.join(os.path.dirname(data["selectedFile"]["path"]), new_file_name)

    # Save the processed dataframe
    df.to_csv(new_file_path, index=False)
    print(f"Modified dataset saved at: {new_file_path}")


if __name__ == "__main__":
    # Check if a JSON argument is provided
    if len(sys.argv) != 2:
        print("Please provide data as a JSON string argument.")
        sys.exit(1)

    # Parse the JSON string into a dictionary
    data = json.loads(sys.argv[1])

    # Process the data
    df_copy, scaler1, scaler2, date_time_columns, originaldf = process_data(data)

    # Train the model
    model, mse, y_pred = train_model(data, df_copy, date_time_columns)
    print(f"Model trained with MSE: {mse}")

    savePredictions(originaldf, y_pred, scaler2, data)


    # # Before saving the processed dataframe
    # current_time_str = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    # base_name, file_extension = os.path.splitext(data["selectedFile"]["name"])
    # new_file_name = f"{base_name}_{current_time_str}{file_extension}"
    # new_file_path = os.path.join(os.path.dirname(data["selectedFile"]["path"]), new_file_name)

    # # Save the processed dataframe
    # df_copy.to_csv(new_file_path, index=False)
    # print(f"Modified dataset saved at: {new_file_path}")