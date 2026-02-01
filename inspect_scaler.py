import joblib
import os

scaler_path = r"D:\Hacktron\scaler.pkl"
try:
    scaler = joblib.load(scaler_path)
    if hasattr(scaler, 'n_features_in_'):
        print(f"Features: {scaler.n_features_in_}")
    elif hasattr(scaler, 'mean_'):
        print(f"Features (mean): {len(scaler.mean_)}")
    else:
        print("Could not determine feature count")
except Exception as e:
    print(f"Error: {e}")
