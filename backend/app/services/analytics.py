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
            return Averages(sentiment=0.0, sleep=0.0, stress=0.0, social=0.0, total_entries=0, current_streak=0, average_words_per_entry=0.0)
        
        sentiment_avg = sum(e.sentiment_level for e in entries if e.sentiment_level is not None) / num_entries
        sleep_avg = sum(e.sleep_quality for e in entries if e.sleep_quality is not None) / num_entries
        stress_avg = sum(e.stress_level for e in entries if e.stress_level is not None) / num_entries
        social_avg = sum(e.social_engagement for e in entries if e.social_engagement is not None) / num_entries
        total_entries = len(entries)
        current_streak = self._calculate_current_streak()
        average_words_per_entry = (sum(len(e.content.split()) for e in entries if e.content)) / (num_entries if num_entries > 0 else 0.0)


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
        entries = get_journal_entries(self.db, from_date=cutoff_date)

        # Create aligned data (same entries for all metrics)
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

        # Extract aligned arrays
        sleep = [d['sleep'] for d in aligned_data]
        sentiment = [d['sentiment'] for d in aligned_data]
        stress = [d['stress'] for d in aligned_data]
        social = [d['social'] for d in aligned_data]
        dates = [d['date'] for d in aligned_data]

        # Calculate all correlations
        correlations = {}
        
        correlations["sleep_sentiment"] = {
            "correlation": np.corrcoef(sleep, sentiment)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": sentiment[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Sentiment Level"
        }
        
        correlations["sleep_stress"] = {
            "correlation": np.corrcoef(sleep, stress)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": stress[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Stress Level"
        }
        
        correlations["sleep_social"] = {
            "correlation": np.corrcoef(sleep, social)[0, 1],
            "data": [{"date": dates[i], "x": sleep[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Sleep Quality",
            "y_label": "Social Engagement"
        }
        
        correlations["sentiment_stress"] = {
            "correlation": np.corrcoef(sentiment, stress)[0, 1],
            "data": [{"date": dates[i], "x": sentiment[i], "y": stress[i]} for i in range(len(dates))],
            "x_label": "Sentiment Level",
            "y_label": "Stress Level"
        }
        
        correlations["sentiment_social"] = {
            "correlation": np.corrcoef(sentiment, social)[0, 1],
            "data": [{"date": dates[i], "x": sentiment[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Sentiment Level",
            "y_label": "Social Engagement"
        }
        
        correlations["stress_social"] = {
            "correlation": np.corrcoef(stress, social)[0, 1],
            "data": [{"date": dates[i], "x": stress[i], "y": social[i]} for i in range(len(dates))],
            "x_label": "Stress Level",
            "y_label": "Social Engagement"
        }

        # Filter out NaN correlations and sort by absolute value
        valid_correlations = {
            k: v for k, v in correlations.items() 
            if not np.isnan(v["correlation"])
        }
        
        # Sort by absolute correlation value (strongest first)
        sorted_correlations = sorted(
            valid_correlations.items(), 
            key=lambda x: abs(x[1]["correlation"]), 
            reverse=True
        )

        # Return top 2 strongest correlations
        top_correlations = dict(sorted_correlations[:2])
        
        return {
            "strongest_correlations": top_correlations,
            "total_data_points": len(aligned_data)
        }
    
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
    
    def _calculate_current_streak(self) -> int:
        """
        Calculate the current streak of consecutive days with journal entries.
        
        Returns:
            int: Number of consecutive days with entries (starting from today).
        """
        current_date = datetime.now(timezone.utc).date()
        streak = 0
        
        # Check each day backwards from today
        while True:
            # Get entries for this specific date
            entries = get_journal_entries(
                self.db, 
                from_date=datetime.combine(current_date, datetime.min.time(), timezone.utc),
                to_date=datetime.combine(current_date, datetime.max.time(), timezone.utc)
            )
            
            if entries:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
                
        return streak