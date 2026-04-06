from beanie import Document
from enum import Enum
from datetime import datetime
from typing import Optional

class CallStatus(str, Enum):
    SCHEDULED = "scheduled"  # planned call (future)
    QUEUED = "queued"  # waiting to be dialed
    RINGING = "ringing"  # phone ringing
    IN_PROGRESS = "in-progress"  # call picked up
    COMPLETED = "completed"  # call finished successfully
    FAILED = "failed"  # technical failure
    NO_ANSWER = "no-answer"  # user didn’t pick
    BUSY = "busy"  # line busy
    CANCELED = "canceled"  # manually stopped


class User(Document):
    name: str
    email: str
    phone_number: str
    state: str
    city: str
    address: str
    selected_program: str
    selected_course: str
    specialization: str
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"

class Call(Document):
    user_id: str
    call_sid: str
    status: CallStatus
    scheduled_time: Optional[datetime] = None
    next_retry_time: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    recording_url: Optional[str] = None
    user_requested_callback: bool = False
    callback_time: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "calls"


class CallAnalysis(Document):
    call_id: str
    transcript: Optional[str] = None
    summary: list | str | None = None
    intent: Optional[str] = None
    outcome: Optional[str] = None
    quality_score: Optional[int] = None
    sentiment: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "call_analysis"

# class User(Document):
#     name: str
#     email: str
#     password: str
#     state: str
#     city: str
#     address: str
#     selected_program: str
#     selected_course: str
#     specialization: str
#     phonenumber: str
#     call_sid: str
#     cost: int | None = None
#     Transcript: str | None = None
#     Duration: int | None = None
#     Quality_Score: int | None = None
#     Analysis: str | None = None
#     Recording_URL: str | None = None
#     CallerZip: str | None = None
#     Intent: str | None = None
#     Outcome: str | None = None
#     time_to_call: Optional[datetime] = None
#     status: CallStatus = CallStatus.PENDING
#     created_at: datetime = Field(default_factory=datetime.utcnow)
#     updated_at: datetime = Field(default_factory=datetime.utcnow)

#     class Settings:
#         name = "users"
