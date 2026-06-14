import pandas as pd
import numpy as np

def generate_conversion_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive features for conversion model."""
    df_out = df.copy()
    
    # Engagement ratio
    df_out['engagement_score'] = (df_out['intent_score'] + (100 - df_out['fatigue_score'])) / 2.0
    
    # Abandon rate proxy
    df_out['cart_abandon_rate'] = df_out['abandonments'] / (df_out['cart_count'] + 1)
    
    return df_out

def generate_channel_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive features for best channel model."""
    df_out = df.copy()
    
    # Calculate channel affinity score based on click rates
    df_out['max_click_rate'] = df_out[['email_click_rate', 'whatsapp_click_rate', 'push_click_rate']].max(axis=1)
    df_out['is_highly_engaged'] = (df_out['max_click_rate'] > 0.5).astype(int)
    
    return df_out

def generate_identity_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract identity resolution matching features."""
    df_out = df.copy()
    
    # Synthesize missing matching features if needed (assuming dataset has them)
    # The actual identities dataset currently doesn't have same_city, etc., 
    # so we will generate synthetic combinations to train the rules engine.
    
    return df_out
