from decimal import Decimal
from app.rules.engine import compute_equipment_needs, load_rules, _get_budget_multiplier, _get_phase_multiplier


CATEGORIES = [
    "excavator", "loader", "dozer", "grader", "compactor",
    "dump_truck", "crusher", "drill", "generator", "water_truck",
]


def test_load_rules():
    rules = load_rules()
    assert "phase_multipliers" in rules
    assert "budget_buckets" in rules
    assert "project_types" in rules
    assert "mine" in rules["project_types"]


def test_all_10_categories_returned():
    estimates = compute_equipment_needs("mine", "construction")
    returned_cats = {e.category for e in estimates}
    for cat in CATEGORIES:
        assert cat in returned_cats, f"Missing category: {cat}"


def test_construction_phase_has_quantities():
    estimates = compute_equipment_needs("mine", "construction", Decimal("200000000"))
    for e in estimates:
        assert e.qty_max >= e.qty_min
        assert e.estimated is True
        assert "rules engine" in e.rationale.lower()

    excavator = next(e for e in estimates if e.category == "excavator")
    assert excavator.qty_min >= 1
    assert excavator.qty_max >= 4


def test_study_phase_near_zero():
    estimates = compute_equipment_needs("road", "study")
    total_max = sum(e.qty_max for e in estimates)
    assert total_max <= 5, "Study phase should produce near-zero quantities"


def test_mega_budget_scales_up():
    small = compute_equipment_needs("mine", "construction", Decimal("30000000"))
    mega = compute_equipment_needs("mine", "construction", Decimal("2000000000"))

    small_total = sum(e.qty_max for e in small)
    mega_total = sum(e.qty_max for e in mega)
    assert mega_total > small_total * 2, "Mega budget should produce much more equipment"


def test_unknown_type_uses_default():
    estimates = compute_equipment_needs("spaceship", "construction")
    assert len(estimates) == 10
    excavator = next(e for e in estimates if e.category == "excavator")
    assert excavator.qty_max > 0


def test_confidence_increases_with_info():
    basic = compute_equipment_needs("mine", "study")
    full = compute_equipment_needs("mine", "construction", Decimal("500000000"))

    basic_conf = next(e for e in basic if e.category == "excavator").confidence
    full_conf = next(e for e in full if e.category == "excavator").confidence
    assert full_conf > basic_conf


def test_phase_multipliers():
    rules = load_rules()
    assert _get_phase_multiplier("construction", rules) == 1.0
    assert _get_phase_multiplier("study", rules) == 0.0
    assert _get_phase_multiplier("tender", rules) == 0.3


def test_budget_multipliers():
    rules = load_rules()
    assert _get_budget_multiplier(Decimal("10000000"), rules) == 0.5
    assert _get_budget_multiplier(Decimal("100000000"), rules) == 1.0
    assert _get_budget_multiplier(Decimal("300000000"), rules) == 1.8
    assert _get_budget_multiplier(Decimal("1000000000"), rules) == 3.0
    assert _get_budget_multiplier(None, rules) == 1.0


def test_all_project_types():
    for ptype in ["mine", "road", "port", "rail", "dam", "industrial_zone", "energy"]:
        estimates = compute_equipment_needs(ptype, "construction", Decimal("200000000"))
        assert len(estimates) == 10, f"Expected 10 categories for {ptype}"
        total = sum(e.qty_max for e in estimates)
        assert total > 0, f"No equipment for {ptype}/construction?"
