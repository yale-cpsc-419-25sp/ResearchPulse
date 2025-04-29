"""Program for database"""
import mysql.connector

db = mysql.connector.connect(
    host="researchpulse.cbkkuyoa4oz7.us-east-2.rds.amazonaws.com",  # RDS Endpoint
    user="admin",  # RDS Username
    password="c0eYBliLpdHULPaktvSE",  # RDS Password
    database="researchpulse",  # Database name
    port=3306  # Default MySQL port
)
print("Successfully connected to Amazon RDS!")

cursor = db.cursor()

# Directly execute the CREATE DATABASE query
# cursor.execute("CREATE DATABASE IF NOT EXISTS researchpulse")
# db.commit()

cursor.execute("SHOW TABLES")
# Fetch all the results (table names)
tables = cursor.fetchall()

# Print the list of tables
print("Tables in the 'researchpulse' database:")
for table in tables:
    print(table[0])  # Each item is a tuple, so we access the first element

# Print the first row from the first 3 tables
for i, table in enumerate(tables[:3]):  # Limit to first 3 tables
    table_name = table[0]
    print(f"\nFirst row of table '{table_name}':")

    # Execute a query to get the first row of the table
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")

    # Fetch and print the first row
    first_row = cursor.fetchone()
    print(first_row if first_row else "No data available in this table.")

cursor.close()
db.close()
