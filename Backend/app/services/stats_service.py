from app.models.user import User, Call, CallStatus
from datetime import datetime, timedelta
from collections import defaultdict

async def get_dashboard_stats():
    """
    Returns full real-time dashboard statistics:
    - Counts: total_students, total_calls, completed, failed
    - chart_data: { pie: [], bar: [] }
    - recent_calls: [ { name, phone, status, duration, date } ]
    """
    # 1. Basic Counts
    total_students = await User.count()
    total_calls = await Call.count()
    completed_calls = await Call.find(Call.status == CallStatus.COMPLETED).count()
    failed_calls = await Call.find(Call.status == CallStatus.FAILED).count()

    # 2. Pie Chart: Call Status Distribution
    # Fetch all statuses to aggregate (for smaller datasets, this is fine; for larger, use mongo aggregate)
    all_calls = await Call.all().to_list()
    status_counts = defaultdict(int)
    for c in all_calls:
        status_counts[c.status.value] += 1

    pie_data = [
        {"name": status.title().replace("-", " "), "value": count}
        for status, count in status_counts.items()
    ]

    # 3. Bar Chart: Calls per Day (Last 7 Days)
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    recent_calls_data = await Call.find(Call.created_at >= seven_days_ago).to_list()
    daily_counts = defaultdict(int)
    for c in recent_calls_data:
        day_str = c.created_at.strftime("%a")  # e.g. "Mon"
        daily_counts[day_str] += 1

    # Ensure all 7 days are represented
    days_order = [(now - timedelta(days=i)).strftime("%a") for i in range(6, -1, -1)]
    bar_data = [{"name": day, "calls": daily_counts[day]} for day in days_order]

    # 4. Recent Calls Table (Latest 10)
    latest_calls = await Call.find().sort(-Call.created_at).limit(10).to_list()
    recent_calls_list = []

    for c in latest_calls:
        user = await User.get(c.user_id) if c.user_id else None
        recent_calls_list.append(
            {
                "id": str(c.id),
                "name": user.name if user else "Unknown Student",
                "phone": user.phone_number if user else "N/A",
                "status": c.status.value,
                "duration": f"{c.duration}s" if c.duration else "0s",
                "date": c.created_at.strftime(
                    "%b %d, %I:%M %p"
                ),  # e.g. "Apr 06, 10:42 AM"
            }
        )

    return {
        "total_calls": total_calls,
        "total_students": total_students,
        "completed_calls": completed_calls,
        "failed_calls": failed_calls,
        "chart_data": {"pie": pie_data, "bar": bar_data},
        "recent_calls": recent_calls_list,
    }
