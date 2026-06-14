import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

class BasePreprocessor:
    def __init__(self):
        self.encoders = {}
        self.scaler = StandardScaler()
        
    def fit_transform_categorical(self, df: pd.DataFrame, categorical_cols: list) -> pd.DataFrame:
        df_out = df.copy()
        for col in categorical_cols:
            le = LabelEncoder()
            # Convert to string and handle missing
            df_out[col] = df_out[col].fillna('UNKNOWN').astype(str)
            df_out[col] = le.fit_transform(df_out[col])
            self.encoders[col] = le
        return df_out
        
    def transform_categorical(self, df: pd.DataFrame, categorical_cols: list) -> pd.DataFrame:
        df_out = df.copy()
        for col in categorical_cols:
            if col in self.encoders:
                le = self.encoders[col]
                # Handle unseen labels by mapping them to UNKNOWN if present, or 0
                df_out[col] = df_out[col].fillna('UNKNOWN').astype(str)
                # Ensure unseen categories are handled safely
                classes = list(le.classes_)
                df_out[col] = df_out[col].apply(lambda x: x if x in classes else classes[0])
                df_out[col] = le.transform(df_out[col])
        return df_out

    def scale_numerical(self, df: pd.DataFrame, numerical_cols: list, is_training: bool = True) -> pd.DataFrame:
        df_out = df.copy()
        # Fill missing numeric values with 0
        df_out[numerical_cols] = df_out[numerical_cols].fillna(0)
        
        if is_training:
            df_out[numerical_cols] = self.scaler.fit_transform(df_out[numerical_cols])
        else:
            df_out[numerical_cols] = self.scaler.transform(df_out[numerical_cols])
            
        return df_out

    def save(self, filepath: str):
        joblib.dump({"encoders": self.encoders, "scaler": self.scaler}, filepath)

    def load(self, filepath: str):
        state = joblib.load(filepath)
        self.encoders = state["encoders"]
        self.scaler = state["scaler"]
