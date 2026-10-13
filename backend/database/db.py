"""
SaFact Database Module
Lightweight SQLite storage for alerts, incident records, and risk history.
"""

import sqlite3
import os
import time
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "safact.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Alerts & Incidents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        timestamp REAL NOT NULL,
        datetime_str TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        zone_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        acknowledged INTEGER NOT NULL DEFAULT 0,
        person_count INTEGER DEFAULT 0,
        risk_score REAL DEFAULT 0.0
    );
    """)

    # Risk Transition History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL NOT NULL,
        datetime_str TEXT NOT NULL,
        risk_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        person_count INTEGER NOT NULL,
        density REAL NOT NULL,
        dominant_zone TEXT
    );
    """)

    # System Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)

    conn.commit()

    # Seed initial baseline incident records if table is empty
    cursor.execute("SELECT COUNT(*) FROM incidents")
    count = cursor.fetchone()[0]
    if count == 0:
        now = time.time()
        initial_records = [
            (
                "INC-001",
                now - 14400,
                time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now - 14400)),
                "LOW",
                "Concourse System Boot & Baseline Initialized",
                "Optical sensors and spatial grids established nominal operational baseline.",
                "ZONE_A",
                "RESOLVED",
                1,
                12,
                18.5
            ),
            (
                "INC-002",
                now - 7200,
                time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now - 7200)),
                "MODERATE",
                "Sector Flux Advisory",
                "Transit arrival generated localized crowd surge near Central Platform.",
                "ZONE_B",
                "RESOLVED",
                1,
                24,
                48.0
            ),
            (
                "INC-003",
                now - 1800,
                time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now - 1800)),
                "HIGH",
                "Bottleneck Density Alert",
                "Density in Turnstile Corridor exceeded 2.2 p/m2. Marshal inspection recommended.",
                "ZONE_C",
                "ACTIVE",
                0,
                38,
                74.0
            )
        ]
        cursor.executemany("""
        INSERT INTO incidents (id, timestamp, datetime_str, severity, title, description, zone_id, status, acknowledged, person_count, risk_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_records)
        conn.commit()

    conn.close()

# Auto-initialize database on import
init_db()
