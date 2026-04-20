import csv
import io
import asyncio
import tempfile
from pathlib import Path
from app.ingestion.connectors.ppi import PPIConnector


SAMPLE_CSV = """project_name,country,region,sector,status,total_investment,financial_closure,url
Mine d'or Test,Senegal,Kédougou,Energy,Active,350000000,2025-06-01,https://example.com
Autoroute Test,Ghana,Accra,Transport,Construction,820000000,2026-01-15,https://example.com
Empty Title,,,,,,
Barrage Test,Cameroon,Centre,Water,Operational,680000000,2023-01-01,https://example.com
"""


def test_ppi_parse_count():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, encoding="utf-8") as f:
        f.write(SAMPLE_CSV)
        f.flush()
        path = f.name

    connector = PPIConnector(config={"file_path": path})
    assets = asyncio.get_event_loop().run_until_complete(connector.fetch())

    # "Empty Title" row should be skipped
    assert len(assets) == 3


def test_ppi_parse_fields():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, encoding="utf-8") as f:
        f.write(SAMPLE_CSV)
        f.flush()
        path = f.name

    connector = PPIConnector(config={"file_path": path})
    assets = asyncio.get_event_loop().run_until_complete(connector.fetch())

    mine = assets[0]
    assert mine.title == "Mine d'or Test"
    assert mine.country == "Senegal"
    assert mine.source == "PPI Database"


def test_ppi_type_mapping():
    assert PPIConnector._map_type("Transport") == "road"
    assert PPIConnector._map_type("Energy") == "energy"
    assert PPIConnector._map_type("Water") == "dam"
    assert PPIConnector._map_type("Unknown") == "infrastructure"


def test_ppi_phase_mapping():
    assert PPIConnector._map_phase("Construction") == "construction"
    assert PPIConnector._map_phase("Operational") == "ops"
    assert PPIConnector._map_phase("Cancelled") == "study"
    assert PPIConnector._map_phase("Active") == "financing"


def test_ppi_country_filter():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, encoding="utf-8") as f:
        f.write(SAMPLE_CSV)
        f.flush()
        path = f.name

    connector = PPIConnector(config={"file_path": path, "country_filter": ["SENEGAL"]})
    assets = asyncio.get_event_loop().run_until_complete(connector.fetch())

    assert len(assets) == 1
    assert assets[0].country == "Senegal"
