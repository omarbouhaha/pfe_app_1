# # train.py
# import sys

# print(sys.executable)
# from sklearn.linear_model import LinearRegression
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import mean_squared_error
# import numpy as np
# import json

# # Create some simple data
# X = np.random.rand(100, 1)
# y = 2 + 3 * X + np.random.rand(100, 1)

# # Split the data into training/testing sets
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# # Create linear regression model
# model = LinearRegression()

# # Train the model using the training sets
# model.fit(X_train, y_train)

# # Make predictions using the testing set
# y_pred = model.predict(X_test)

# # Calculate Mean Squared Error
# mse = mean_squared_error(y_test, y_pred)

# # Return MSE
# print(json.dumps({'mse': mse}))
import tensorflow as tf

print("Num GPUs Available: ", len(tf.config.experimental.list_physical_devices('GPU')))

if tf.config.experimental.list_physical_devices('GPU'):
    print("GPU is available!")
else:
    print("GPU is not available.")
