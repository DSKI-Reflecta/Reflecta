"""
Analytics service for calculating journal entry metrics and patterns.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from collections import defaultdict

import numpy as np
from sqlalchemy.orm import Session

from app.db.crud.journal import get_journal_entries
from app.models.analytics import TsTrends, Averages


class AnalyticsService:
    """Service class for journal entry analytics calculations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_trends(self, past_days: int) -> TsTrends:
        """
        Calculate time series trends for sentiment, sleep, stress, and social engagement.
        
        Args:
            past_days (int): Number of past days to include in analysis.
            
        Returns:
            TsTrends: Object containing dates and corresponding metric values.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = get_journal_entries(self.db, from_date=cutoff_date)

        return TsTrends(
            dates=[e.date.strftime("%Y-%m-%d") for e in entries],
            sentiment=[e.sentiment_level for e in entries],
            sleep=[e.sleep_quality for e in entries],
            stress=[e.stress_level for e in entries],
            social=[e.social_engagement for e in entries],
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
            return Averages(sentiment=0.0, sleep=0.0, stress=0.0, social=0.0)
        
        sentiment_avg = sum(e.sentiment_level for e in entries if e.sentiment_level is not None) / num_entries
        sleep_avg = sum(e.sleep_quality for e in entries if e.sleep_quality is not None) / num_entries
        stress_avg = sum(e.stress_level for e in entries if e.stress_level is not None) / num_entries
        social_avg = sum(e.social_engagement for e in entries if e.social_engagement is not None) / num_entries

        return Averages(
            sentiment=sentiment_avg,
            sleep=sleep_avg,
            stress=stress_avg,
            social=social_avg,
        )
    
    def calculate_correlations(self, past_days: int) -> Dict[str, float]:
        """
        Calculate correlations between different metrics.
        
        Args:
            past_days (int): Number of past days to consider for correlation analysis.
            
        Returns:
            Dict[str, float]: Dictionary containing correlation coefficients.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = get_journal_entries(self.db, from_date=cutoff_date)

        # Extract metric arrays
        sleep = [e.sleep_quality for e in entries if e.sleep_quality is not None]
        sentiment = [e.sentiment_level for e in entries if e.sentiment_level is not None]
        stress = [e.stress_level for e in entries if e.stress_level is not None]
        social = [e.social_engagement for e in entries if e.social_engagement is not None]

        # Calculate correlations
        correlations = {}
        
        if len(sleep) > 1 and len(sentiment) > 1:
            correlations["sleep_sentiment_correlation"] = np.corrcoef(sleep, sentiment)[0, 1]
        if len(sleep) > 1 and len(stress) > 1:
            correlations["sleep_stress_correlation"] = np.corrcoef(sleep, stress)[0, 1]
        if len(sleep) > 1 and len(social) > 1:
            correlations["sleep_social_correlation"] = np.corrcoef(sleep, social)[0, 1]
        if len(sentiment) > 1 and len(stress) > 1:
            correlations["sentiment_stress_correlation"] = np.corrcoef(sentiment, stress)[0, 1]
        if len(sentiment) > 1 and len(social) > 1:
            correlations["sentiment_social_correlation"] = np.corrcoef(sentiment, social)[0, 1]
        if len(stress) > 1 and len(social) > 1:
            correlations["stress_social_correlation"] = np.corrcoef(stress, social)[0, 1]

        return correlations
    
    def calculate_weekly_patterns(self, past_days: int) -> Dict[str, Dict[int, Optional[float]]]:
        """
        Calculate average values per weekday for each metric.
        
        Args:
            past_days (int): Number of past days to consider for weekly analysis.
            
        Returns:
            Dict[str, Dict[int, Optional[float]]]: Nested dictionary with metrics and weekday averages.
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=past_days)
        entries = get_journal_entries(self.db, from_date=cutoff_date)

        # Group data by weekday
        weekday_data = {
            "sleep_quality": defaultdict(list),
            "sentiment_level": defaultdict(list),
            "stress_level": defaultdict(list),
            "social_engagement": defaultdict(list),
        }

        for entry in entries:
            weekday = entry.date.weekday()  # 0 = Monday, 6 = Sunday
            
            if entry.sleep_quality is not None:
                weekday_data["sleep_quality"][weekday].append(entry.sleep_quality)
            if entry.sentiment_level is not None:
                weekday_data["sentiment_level"][weekday].append(entry.sentiment_level)
            if entry.stress_level is not None:
                weekday_data["stress_level"][weekday].append(entry.stress_level)
            if entry.social_engagement is not None:
                weekday_data["social_engagement"][weekday].append(entry.social_engagement)

        # Calculate averages per weekday
        averages = {}
        for field, days in weekday_data.items():
            averages[field] = {}
            for weekday in range(7):
                values = days.get(weekday, [])
                averages[field][weekday] = (
                    round(float(np.mean(values)), 2) if values else None
                )

        return averages
    
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

        entries = get_journal_entries(self.db, from_date=from_date, to_date=to_date)
        
        if not entries:
            return []

        entry_details = []
        for entry in entries:
            goal_titles = [goal.title for goal in entry.goals]
            entry_details.append(
                f"Sentiments: {entry.sentiments}, Activities: {entry.activities}, Goals: {', '.join(goal_titles)}"
            )

        return entry_details