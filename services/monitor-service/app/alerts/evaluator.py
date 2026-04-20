"""
Alert rule evaluator.

A rule is a JSON dict with optional keys:
  country:    list[str]       — project.country must be in list
  type:       list[str]       — project.type must be in list
  phase:      list[str]       — project.phase must be in list
  budget_min: number          — project.budget_usd >= budget_min
  budget_max: number          — project.budget_usd <= budget_max
  keywords:   list[str]       — any keyword must appear in project.title (case-insensitive)

All present conditions must match (AND logic).
Missing/empty conditions are ignored.

Example rule:
  {
    "country": ["Senegal", "Ghana"],
    "type": ["mine"],
    "budget_min": 100000000,
    "phase": ["tender", "construction"]
  }
"""
from __future__ import annotations
from app.models import Project


def evaluate_rule(rule: dict, project: Project) -> bool:
    countries = rule.get("country", [])
    if countries and (project.country or "") not in countries:
        return False

    types = rule.get("type", [])
    if types and (project.type or "") not in types:
        return False

    phases = rule.get("phase", [])
    if phases and (project.phase or "") not in phases:
        return False

    budget_min = rule.get("budget_min")
    if budget_min is not None:
        budget = float(project.budget_usd or 0)
        if budget < float(budget_min):
            return False

    budget_max = rule.get("budget_max")
    if budget_max is not None:
        budget = float(project.budget_usd or 0)
        if budget > float(budget_max):
            return False

    keywords = rule.get("keywords", [])
    if keywords:
        title_lower = (project.title or "").lower()
        if not any(kw.lower() in title_lower for kw in keywords):
            return False

    return True
