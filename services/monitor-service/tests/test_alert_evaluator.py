from decimal import Decimal
from app.alerts.evaluator import evaluate_rule
from app.models import Project


def _make_project(**kwargs) -> Project:
    defaults = {
        "title": "Mine d'or Test",
        "type": "mine",
        "phase": "construction",
        "country": "Senegal",
        "budget_usd": Decimal("200000000"),
    }
    defaults.update(kwargs)
    p = Project()
    for k, v in defaults.items():
        setattr(p, k, v)
    return p


def test_empty_rule_matches_all():
    assert evaluate_rule({}, _make_project()) is True


def test_country_match():
    rule = {"country": ["Senegal", "Ghana"]}
    assert evaluate_rule(rule, _make_project(country="Senegal")) is True
    assert evaluate_rule(rule, _make_project(country="Nigeria")) is False


def test_type_match():
    rule = {"type": ["mine", "road"]}
    assert evaluate_rule(rule, _make_project(type="mine")) is True
    assert evaluate_rule(rule, _make_project(type="port")) is False


def test_phase_match():
    rule = {"phase": ["tender", "construction"]}
    assert evaluate_rule(rule, _make_project(phase="construction")) is True
    assert evaluate_rule(rule, _make_project(phase="study")) is False


def test_budget_min():
    rule = {"budget_min": 100_000_000}
    assert evaluate_rule(rule, _make_project(budget_usd=Decimal("200000000"))) is True
    assert evaluate_rule(rule, _make_project(budget_usd=Decimal("50000000"))) is False
    assert evaluate_rule(rule, _make_project(budget_usd=None)) is False


def test_budget_max():
    rule = {"budget_max": 500_000_000}
    assert evaluate_rule(rule, _make_project(budget_usd=Decimal("200000000"))) is True
    assert evaluate_rule(rule, _make_project(budget_usd=Decimal("800000000"))) is False


def test_keywords():
    rule = {"keywords": ["mine", "gold"]}
    assert evaluate_rule(rule, _make_project(title="Mine d'or de Kédougou")) is True
    assert evaluate_rule(rule, _make_project(title="Autoroute Dakar")) is False


def test_combined_and_logic():
    rule = {
        "country": ["Senegal"],
        "type": ["mine"],
        "budget_min": 100_000_000,
        "phase": ["construction"],
    }
    assert evaluate_rule(rule, _make_project()) is True
    assert evaluate_rule(rule, _make_project(country="Ghana")) is False
    assert evaluate_rule(rule, _make_project(type="road")) is False
    assert evaluate_rule(rule, _make_project(budget_usd=Decimal("50000000"))) is False
    assert evaluate_rule(rule, _make_project(phase="study")) is False
