"""
SaFact Database Repository
Queries and updates for incidents, alerts, and historical telemetry logs.
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from database.db import get_connection

class IncidentRepository:
    @staticmethod
    def get_all(severity: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM incidents WHERE 1=1"
        params = []
        
        if severity and severity.upper() != "ALL":
            query += " AND UPPER(severity) = ?"
            params.append(severity.upper())
            
        if status and status.upper() != "ALL":
            query += " AND UPPER(status) = ?"
            params.append(status.upper())
            
        query += " ORDER BY timestamp DESC LIMIT 100"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def create_incident(severity: str, title: str, description: str, zone_id: str, person_count: int, risk_score: float) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        dt_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
        inc_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        
        cursor.execute("""
        INSERT INTO incidents (id, timestamp, datetime_str, severity, title, description, zone_id, status, acknowledged, person_count, risk_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0, ?, ?)
        """, (inc_id, now, dt_str, severity.upper(), title, description, zone_id, person_count, risk_score))
        
        conn.commit()
        conn.close()
        return {
            "id": inc_id,
            "timestamp": now,
            "datetime_str": dt_str,
            "severity": severity.upper(),
            "title": title,
            "description": description,
            "zone_id": zone_id,
            "status": "ACTIVE",
            "acknowledged": 0,
            "person_count": person_count,
            "risk_score": risk_score
        }

    @staticmethod
    def acknowledge_incident(incident_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE incidents SET acknowledged = 1 WHERE id = ?", (incident_id,))
        affected = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return affected

    @staticmethod
    def resolve_incident(incident_id: str) -> bool:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE incidents SET status = 'RESOLVED', acknowledged = 1 WHERE id = ?", (incident_id,))
        affected = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return affected

    @staticmethod
    def record_risk_snapshot(risk_score: float, risk_level: str, person_count: int, density: float, dominant_zone: str = "ZONE_A"):
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        dt_str = time.strftime("%H:%M:%S", time.localtime(now))
        
        cursor.execute("""
        INSERT INTO risk_history (timestamp, datetime_str, risk_score, risk_level, person_count, density, dominant_zone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (now, dt_str, risk_score, risk_level, person_count, density, dominant_zone))
        
        # Keep only trailing 200 records
        cursor.execute("DELETE FROM risk_history WHERE id NOT IN (SELECT id FROM risk_history ORDER BY id DESC LIMIT 200)")
        
        conn.commit()
        conn.close()

    @staticmethod
    def get_risk_history(limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM risk_history ORDER BY id DESC LIMIT ?", (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return list(reversed(rows))
