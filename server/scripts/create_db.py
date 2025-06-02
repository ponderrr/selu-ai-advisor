import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    dbname = "aidvisor"
    user = "postgres"
    password = "9873"
    host = "localhost"
    port = "5432"

    con = psycopg2.connect(dbname="postgres", user=user, password=password, host=host, port=port)
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cur = con.cursor()
    cur.execute(f"CREATE DATABASE {dbname}")
    cur.close()
    con.close()

    print(f"✅ Database '{dbname}' created.")

if __name__ == "__main__":
    create_database()
