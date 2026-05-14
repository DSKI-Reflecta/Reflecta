from typing import List
from ...models.entry_goal import Goal


def get_recent_entries(
    goals: List[Goal],
    max_entries_per_goal: int = 5
):
    # For each goal, filter to keep only the most recent entries
    for goal in goals:
        if goal.journal_entries:
            # Sort entries by date (newest first)
            sorted_entries = sorted(goal.journal_entries,
                                    key=lambda entry: entry.date,
                                    reverse=True)
            # Keep only the max number specified
            goal.journal_entries = sorted_entries[:max_entries_per_goal]

    return goals
