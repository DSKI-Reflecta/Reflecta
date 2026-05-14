"""
Analytics service for calculating journal entry metrics and patterns.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import json

import numpy as np
from sqlalchemy.orm import Session

from app.db.crud.journal import get_journal_entries
from app.models.analytics import TsTrends, Averages
from app.services.gemini_agent import generate_correlation_insights


class AnalyticsService:
    """Service class for journal entry analytics calculations."""

    def __init__(self, db: Session):
        self.db = db

    def calculate_trends(self, past_days: int) -> TsTrends:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = sorted(get_journal_entries(
            self.db, from_date=cutoff_date), key=lambda x: x.date)
        if not entries:
            return TsTrends(dates=[], sentiment=[], sleep=[], stress=[], social=[])
        
        # Auto window size: 3-21 days based on period
        window = min(21, max(3, past_days // 7))
        
        def moving_avg(data):
            if len(data) < window:
                return data  # Return original data if not enough points
            
            result = []
            half_window = window // 2
            
            for i in range(len(data)):
                # Calculate window bounds, ensuring we stay within data bounds
                start = max(0, i - half_window)
                end = min(len(data), i + half_window + 1)
                
                # Calculate average of current window
                window_data = data[start:end]
                avg = sum(window_data) / len(window_data)
                result.append(avg)
            
            return result
        
        # Calculate moving averages
        sentiment_ma = moving_avg([e.sentiment_level for e in entries])
        sleep_ma = moving_avg([e.sleep_quality for e in entries])
        stress_ma = moving_avg([e.stress_level for e in entries])
        social_ma = moving_avg([e.social_engagement for e in entries])
        
        return TsTrends(
            dates=[e.date.strftime("%Y-%m-%d") for e in entries],
            sentiment=[round(x) for x in sentiment_ma],
            sleep=[round(x) for x in sleep_ma],
            stress=[round(x) for x in stress_ma],
            social=[round(x) for x in social_ma],
        )

    def calculate_averages(self, past_days: int) -> Averages:
        """
        Calculate average values for sentiment, sleep, stress, and social engagement.

        Args:
            past_days (int): Number of past days to include in calculation.

        Returns:
            Averages: Object containing average values for each metric.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = get_journal_entries(self.db, from_date=cutoff_date)

        # Calculate averages, handling cases where lists are empty to avoid zero division
        num_entries = len(entries)

        if num_entries == 0:
            return Averages(sentiment=0.0, sleep=0.0, stress=0.0, social=0.0, total_entries=0, current_streak=0, average_words_per_entry=0.0)

        sentiment_avg = sum(
            e.sentiment_level for e in entries if e.sentiment_level is not None) / num_entries
        sleep_avg = sum(
            e.sleep_quality for e in entries if e.sleep_quality is not None) / num_entries
        stress_avg = sum(
            e.stress_level for e in entries if e.stress_level is not None) / num_entries
        social_avg = sum(
            e.social_engagement for e in entries if e.social_engagement is not None) / num_entries
        total_entries = len(entries)
        current_streak = self._calculate_current_streak()
        average_words_per_entry = (sum(len(e.content.split(
        )) for e in entries if e.content)) / (num_entries if num_entries > 0 else 0.0)

        return Averages(
            sentiment=sentiment_avg,
            sleep=sleep_avg,
            stress=stress_avg,
            social=social_avg,
            total_entries=total_entries,
            current_streak=current_streak,
            average_words_per_entry=average_words_per_entry,
        )

    def calculate_correlations(self, past_days: int) -> Dict[str, Any]:
        """
        Calculate correlations between different metrics and return the 2 strongest correlations.

        Args:
            past_days (int): Number of past days to consider for correlation analysis.

        Returns:
            Dict[str, Any]: Dictionary containing the 2 strongest correlations with their data points.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = sorted(get_journal_entries(
            self.db, from_date=cutoff_date), key=lambda x: x.date)

        aligned_data = []
        for entry in entries:
            if (entry.sleep_quality is not None and
                entry.sentiment_level is not None and
                entry.stress_level is not None and
                    entry.social_engagement is not None):
                aligned_data.append({
                    'date': entry.date.strftime("%Y-%m-%d"),
                    'sleep': entry.sleep_quality,
                    'sentiment': entry.sentiment_level,
                    'stress': entry.stress_level,
                    'social': entry.social_engagement
                })

        if len(aligned_data) < 2:
            return {"message": "Not enough data points for correlation analysis"}

        sleep = [d['sleep'] for d in aligned_data]
        sentiment = [d['sentiment'] for d in aligned_data]
        stress = [d['stress'] for d in aligned_data]
        social = [d['social'] for d in aligned_data]
        dates = [d['date'] for d in aligned_data]

        window = min(21, max(3, past_days // 7))

        def moving_avg(data):
            return np.convolve(data, np.ones(window)/window, mode='same')

        correlations = {}

        correlations["sleep_sentiment"] = {
            "correlation": np.corrcoef(sleep, sentiment)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": sentiment[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Sentiment Level",
            "x_avg": moving_avg(sleep).tolist(),
            "y_avg": moving_avg(sentiment).tolist()
        }

        correlations["sleep_stress"] = {
            "correlation": np.corrcoef(sleep, stress)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": stress[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Stress Level",
            "x_avg": moving_avg(sleep).tolist(),
            "y_avg": moving_avg(stress).tolist()
        }

        correlations["sleep_social"] = {
            "correlation": np.corrcoef(sleep, social)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Social Engagement",
            "x_avg": moving_avg(sleep).tolist(),
            "y_avg": moving_avg(social).tolist()
        }

        correlations["sentiment_stress"] = {
            "correlation": np.corrcoef(sentiment, stress)[0, 1],
            "data": [{"date": dates[i], "x": sentiment[i], "y": stress[i]} for i in range(len(dates))],
            "x_label": "Sentiment Level",
            "y_label": "Stress Level",
            "x_avg": moving_avg(sentiment).tolist(),
            "y_avg": moving_avg(stress).tolist()
        }

        correlations["sentiment_social"] = {
            "correlation": np.corrcoef(sentiment, social)[0, 1],
            "data": [{"date": dates[i], "x": sentiment[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Sentiment Level",
            "y_label": "Social Engagement",
            "x_avg": moving_avg(sentiment).tolist(),
            "y_avg": moving_avg(social).tolist()
        }

        correlations["stress_social"] = {
            "correlation": np.corrcoef(stress, social)[0, 1],
            "data": [{"date": dates[i], "x": stress[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Stress Level",
            "y_label": "Social Engagement",
            "x_avg": moving_avg(stress).tolist(),
            "y_avg": moving_avg(social).tolist()
        }

        valid_correlations = {
            k: v for k, v in correlations.items()
            if not np.isnan(v["correlation"])
        }

        sorted_correlations = sorted(
            valid_correlations.items(),
            key=lambda x: abs(x[1]["correlation"]),
            reverse=True
        )

        top_correlations = dict(sorted_correlations[:2])

        for key, value in top_correlations.items():
            chart_data = json.dumps({
                "x_label": value["x_label"],
                "y_label": value["y_label"],
                "correlation": value["correlation"],
                "data": value["data"]
            })
            insights = generate_correlation_insights(chart_data)
            top_correlations[key]["insights"] = insights

        return {
            "strongest_correlations": top_correlations,
            "total_data_points": len(aligned_data)
        }

    def prepare_summary_data(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> List[str]:
        """
        Prepare journal entry data for summary generation.

        Args:
            from_date (Optional[datetime]): Start date of the period.
            to_date (Optional[datetime]): End date of the period.

        Returns:
            List[str]: List of formatted entry details for summary generation.
        """
        if from_date is None:
            from_date = datetime.now(timezone.utc) - timedelta(days=7)
        if to_date is None:
            to_date = datetime.now(timezone.utc)

        entries = get_journal_entries(
            self.db, from_date=from_date, to_date=to_date)

        if not entries:
            return []

        entry_details = []
        for entry in entries:
            goal_titles = [goal.title for goal in entry.goals]
            entry_details.append(
                f"Sentiments: {entry.sentiments}, Activities: {entry.activities}, Goals: {', '.join(goal_titles)}"
            )

        return entry_details

    def _calculate_current_streak(self) -> int:
        """
        Calculate the current streak of consecutive days with journal entries.

        Returns:
            int: Number of consecutive days with entries (starting from today).
        """
        current_date = datetime.now(timezone.utc).date()
        streak = 0

        while True:
            entries = get_journal_entries(
                self.db,
                from_date=datetime.combine(
                    current_date, datetime.min.time(), timezone.utc),
                to_date=datetime.combine(
                    current_date, datetime.max.time(), timezone.utc)
            )

            if entries:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

        return streak
