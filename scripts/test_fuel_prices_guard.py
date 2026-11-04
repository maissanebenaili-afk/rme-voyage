"""Regression tests for the Weekly Oil Bulletin freshness guard."""
import unittest

from fuel_prices_guard import is_older_observation


class FuelPricesGuardTests(unittest.TestCase):
    def test_rejects_older_observation(self):
        self.assertTrue(is_older_observation("2026-09-21", "2026-10-05"))

    def test_allows_same_observation_date(self):
        self.assertFalse(is_older_observation("2026-10-05", "2026-10-05"))

    def test_allows_newer_observation(self):
        self.assertFalse(is_older_observation("2026-10-08", "2026-10-05"))

    def test_rejects_invalid_incoming_date_by_raising(self):
        with self.assertRaises(ValueError):
            is_older_observation("not-a-date", "2026-10-05")

    def test_rejects_invalid_current_date_by_raising(self):
        with self.assertRaises(ValueError):
            is_older_observation("2026-10-08", "not-a-date")


if __name__ == "__main__":
    unittest.main()
