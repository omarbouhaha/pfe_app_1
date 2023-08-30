import tensorflow as tf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os
import sys
import json
import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

def create_dl_model(model_type, formConfig):
    """
    Create a Deep Learning model based on the specified type and configuration.
    """
    
    model = tf.keras.models.Sequential()
    
    # ANN Time Series Model
    if model_type == "ann_timeseries":
        for i, units in enumerate(formConfig["units_per_hidden_layer"]):
            if i == 0:
                model.add(tf.keras.layers.Dense(units, activation=formConfig["activation"], input_dim=formConfig["input_sequence_length"]))
            else:
                model.add(tf.keras.layers.Dense(units, activation=formConfig["activation"]))
            model.add(tf.keras.layers.Dropout(formConfig["dropout_rate"]))
            
    elif model_type == "lstm_timeseries":
        for i, units in enumerate(formConfig["units_per_hidden_layer"]):
            return_sequences = True if i < len(formConfig["units_per_hidden_layer"]) - 1 else formConfig.get("return_sequences", False)
            if i == 0:
                model.add(tf.keras.layers.LSTM(units, activation=formConfig["activation"], return_sequences=return_sequences, input_shape=(formConfig["input_sequence_length"], len(formConfig["selectedInputColumns"]))))
            else:
                model.add(tf.keras.layers.LSTM(units, activation=formConfig["activation"], return_sequences=return_sequences))
            model.add(tf.keras.layers.Dropout(formConfig["dropout_rate"]))

    elif model_type == "gru_timeseries":
        for i, units in enumerate(formConfig["units_per_hidden_layer"]):
            return_sequences = True if i < len(formConfig["units_per_hidden_layer"]) - 1 else formConfig.get("return_sequences", False)
            if i == 0:
                model.add(tf.keras.layers.GRU(units, activation=formConfig["activation"], return_sequences=return_sequences, input_shape=(formConfig["input_sequence_length"], len(formConfig["selectedInputColumns"]))))
            else:
                model.add(tf.keras.layers.GRU(units, activation=formConfig["activation"], return_sequences=return_sequences))
            model.add(tf.keras.layers.Dropout(formConfig["dropout_rate"]))

    elif model_type == "rnn_timeseries":
        for i, units in enumerate(formConfig["units_per_hidden_layer"]):
            return_sequences = True if i < len(formConfig["units_per_hidden_layer"]) - 1 else formConfig.get("return_sequences", False)
            if i == 0:
                model.add(tf.keras.layers.SimpleRNN(units, activation=formConfig["activation"], return_sequences=return_sequences, input_shape=(formConfig["input_sequence_length"], len(formConfig["selectedInputColumns"]))))
            else:
                model.add(tf.keras.layers.SimpleRNN(units, activation=formConfig["activation"], return_sequences=return_sequences))
            model.add(tf.keras.layers.Dropout(formConfig["dropout_rate"]))

    # Output layer
    model.add(tf.keras.layers.Dense(formConfig["output_sequence_length"]))
    
    optimizer = tf.keras.optimizers.get(formConfig["optimizer"])
    optimizer.learning_rate = formConfig["learning_rate"]
    model.compile(optimizer=optimizer, loss='mse')  # Using Mean Squared Error for regression tasks
    
    return model

def create_sequences(input_data, output_data, input_sequence_length, output_sequence_length):
    x, y = [], []
    for i in range(len(input_data) - input_sequence_length - output_sequence_length + 1):
        x.append(input_data[i:i+input_sequence_length])
        y.append(output_data[i+input_sequence_length:i+input_sequence_length+output_sequence_length])
    return np.array(x), np.array(y)






if __name__ == "__main__":
    # Check if a JSON argument is provided
    if len(sys.argv) != 2:
        print("Please provide data as a JSON string argument.")
        sys.exit(1)

    # Parse the JSON string into a dictionary
    data = json.loads(sys.argv[1])


    # Example Usage:
    formConfig = data["formConfig"]

    model_type = data["model"]
    model = create_dl_model(model_type, formConfig)

    # Print model summary
    model.summary()


    try:
        df = pd.read_csv(data["selectedFile"]["path"])
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)
    
    selected_input_data = df[data["selectedInputColumns"]].values
    selected_output_data = df[data["selectedOutputColumn"]].values.reshape(-1, 1)

    # Normalize the data
    scaler_input = MinMaxScaler()
    scaled_input = scaler_input.fit_transform(selected_input_data)

    scaler_output = MinMaxScaler()
    scaled_output = scaler_output.fit_transform(selected_output_data)

    # Create sequences
    X, y = create_sequences(scaled_input, scaled_output, data["formConfig"]["input_sequence_length"], data["formConfig"]["output_sequence_length"])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)

    # Setting some training parameters
    EPOCHS = 50  # number of times the model will train on the entire dataset
    BATCH_SIZE = 32  # number of samples the model will train on before updating weights

    # Train the model
    history = model.fit(
        X_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(X_test, y_test),  # provide validation data for evaluation
        shuffle=True  # shuffle training data before each epoch
    )

    # Evaluate the model using the test set
    test_loss = model.evaluate(X_test, y_test)
    print(f"Test set loss: {test_loss}")


    # Making predictions on the test set
    y_pred = model.predict(X_test)

    # Reverse the scaling for the predictions
    y_pred_original_scale = scaler_output.inverse_transform(y_pred)

    # Reverse the scaling for the original output data (for comparison)
    y_test_original_scale = scaler_output.inverse_transform(y_test)

    # Extracting the starting index of the test set from the original dataframe
    start_idx = len(X) - len(X_test)

    # Constructing a new dataframe with the original data and predictions
    df_test = df.iloc[start_idx:start_idx + len(X_test)].copy()
    df_test["predictions"] = y_pred_original_scale

    # Save to a new CSV file
    df_test.to_csv("path_to_save_predictions.csv", index=False)

    print("Predictions saved to CSV.")
