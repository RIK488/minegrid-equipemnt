from app.ingestion.fingerprint import compute_fingerprint, normalize_text


def test_normalize_removes_accents():
    assert normalize_text("Barrage de Béni-Mellal") == "barrage de benimellal"


def test_normalize_strips_special_chars():
    assert normalize_text("  Mine (Phase-2) -- Gold!  ") == "mine phase2 gold"


def test_normalize_collapses_whitespace():
    assert normalize_text("a   b   c") == "a b c"


def test_fingerprint_deterministic():
    fp1 = compute_fingerprint("Mine de Kédougou", "Senegal", "PPI", "https://ppi.worldbank.org")
    fp2 = compute_fingerprint("Mine de Kédougou", "Senegal", "PPI", "https://ppi.worldbank.org")
    assert fp1 == fp2
    assert len(fp1) == 64  # sha256 hex


def test_fingerprint_different_inputs():
    fp1 = compute_fingerprint("Mine de Kédougou", "Senegal", "PPI", "https://ppi.worldbank.org")
    fp2 = compute_fingerprint("Mine de Siguiri", "Guinea", "PPI", "https://ppi.worldbank.org")
    assert fp1 != fp2


def test_fingerprint_case_insensitive():
    fp1 = compute_fingerprint("Mine de Kédougou", "SENEGAL", "ppi", "https://PPI.worldbank.org")
    fp2 = compute_fingerprint("mine de kédougou", "senegal", "PPI", "https://ppi.worldbank.org")
    assert fp1 == fp2


def test_fingerprint_handles_empty():
    fp = compute_fingerprint("", "", "", "")
    assert len(fp) == 64
