import os
import sys
import time

# Ensure we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.ai_training.customer_generator import CustomerGenerator
from app.ai_training.identity_generator import IdentityGenerator
from app.ai_training.event_generator import EventGenerator
from app.ai_training.conversion_training_generator import ConversionTrainingGenerator
from app.ai_training.channel_training_generator import ChannelTrainingGenerator
from app.ai_training.nba_training_generator import NBATrainingGenerator
from app.ai_training.export_datasets import DatasetExporter

def main():
    print("=" * 60)
    print("MarketTwin AI - Synthetic Dataset Pipeline")
    print("=" * 60)
    
    start_time = time.time()
    
    exporter = DatasetExporter()
    
    # 1. Customers
    print("\n1. Generating Customers...")
    cust_gen = CustomerGenerator(num_customers=1000)
    customers_df = cust_gen.generate()
    exporter.export_csv(customers_df, "customers.csv")
    
    # 2. Identities
    print("2. Generating Identities...")
    id_gen = IdentityGenerator(customers_df)
    identities_df = id_gen.generate()
    exporter.export_csv(identities_df, "identities.csv")
    
    # 3. Events & Journeys
    print("3. Generating Behavioral Events...")
    evt_gen = EventGenerator(customers_df, identities_df)
    events_df = evt_gen.generate()
    exporter.export_csv(events_df, "events.csv")
    
    # 4. Conversion Training
    print("4. Generating Conversion Training Data...")
    conv_gen = ConversionTrainingGenerator(customers_df, events_df)
    conversion_df = conv_gen.generate()
    exporter.export_csv(conversion_df, "conversion_training.csv")
    
    # 5. Channel Prediction Training
    print("5. Generating Channel Prediction Data...")
    channel_gen = ChannelTrainingGenerator(customers_df, events_df)
    channel_df = channel_gen.generate()
    exporter.export_csv(channel_df, "channel_prediction_training.csv")
    
    # 6. NBA Training
    print("6. Generating Next Best Action Data...")
    nba_gen = NBATrainingGenerator(conversion_df)
    nba_df = nba_gen.generate()
    exporter.export_csv(nba_df, "nba_training.csv")
    
    # 7. Messages
    print("7. Generating Message Personalization Samples...")
    exporter.export_message_samples()
    
    elapsed = time.time() - start_time
    print("=" * 60)
    print(f"Pipeline completed successfully in {elapsed:.2f} seconds.")
    print("=" * 60)

if __name__ == "__main__":
    main()
