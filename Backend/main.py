import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.routes import upload_file, stats, user
from vapi import Vapi
import os
import time
from dotenv import load_dotenv
from prompt.system_prompt import get_prompt
from app.config.dbconfig import connect_db
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload_file.router)
app.include_router(stats.router)
app.include_router(user.router)


@app.get("/check")
def read_root():
    return {"message": "Welcome to the call Management API"}


# Make sure VAPI_API_KEY is loaded in your .env or system environment
vapi = Vapi(token=os.getenv("VAPI_API_KEY"))


# @app.post("/create-call")
# def create_call():
#     """Endpoint to create an outbound call"""
#     call = vapi.calls.create(
#         phone_number_id=os.getenv("VAPI_PHONE_NUMBER_ID"),
#         customer={"number": "+917782827701"},
#         assistant_id=os.getenv("VAPI_ASSISTANT_ID"),
#         # server_url=os.getenv("VAPI_SERVER_WEBHOOK_URL"),
#         assistant_overrides={
#             "firstMessage": "हेलो bicky, आज आप कैसे हैं?",
#             "server": {"url": os.getenv("VAPI_SERVER_WEBHOOK_URL")},
#             "model": {
#                 "provider": "openai",
#                 "model": "gpt-4o-mini",
#                 "messages": [{"role": "system", "content": get_prompt("Aman") }],
#                 "language": "hi",
#             },
#             "voice": {"provider": "11labs", "voiceId": "burt"},
#         },
#     )
#     print("💦💦")
#     print("call", call)
#     return {"call_id": call}


@app.post("/vapi-webhook")
async def vapi_webhook(request: Request):
    print("🔴🔴🔴🔴 Received Webhook")
    data = await request.json()

    # Save the data to a file for easy reading
    with open("webhook_data.json", "w") as f:
        json.dump(data, f, indent=4)

    # Vapi wraps payload inside "message"
    print("😊😊😊😊")
    print(data)
    message = data.get("message", data)
    event_type = message.get("type", data.get("type"))

    print(f"Webhook Event Type: {event_type}")

    # Handle different events
    if event_type == "call.started":
        print("Call started")
        call_id = message.get("call", {}).get("id")
        if call_id:
            from app.models.user import Call, CallStatus

            call_record = await Call.find_one(Call.call_sid == call_id)
            if call_record:
                call_record.status = CallStatus.IN_PROGRESS
                await call_record.save()

    elif event_type in ["call.ended", "end-of-call-report"]:
        print("Call ended... updating database")

        call_id = message.get("call", {}).get("id")
        recording_url = message.get("recordingUrl")
        transcript = message.get("transcript")
        duration = message.get("durationSeconds")
        summary = message.get("summary")
        cost = message.get("cost")

        if call_id:
            from app.models.user import Call, CallStatus, CallAnalysis

            call_record = await Call.find_one(Call.call_sid == call_id)
            if call_record:
                # Update call record
                call_record.status = CallStatus.COMPLETED
                call_record.recording_url = recording_url
                if duration is not None:
                    call_record.duration = int(duration)
                await call_record.save()

                # Analyze transcript using LLM Service
                llm_summary = summary
                llm_intent = None
                llm_outcome = None
                llm_quality_score = None
                transcript_str = None

                if transcript:
                    transcript_str = (
                        transcript
                        if isinstance(transcript, str)
                        else json.dumps(transcript)
                    )
                    try:
                        from app.services.llm_service import analyze_conversation

                        analysis_result = analyze_conversation(transcript_str)
                        if analysis_result:
                            # If summary is a list of objects, we can convert it to dictionaries
                            if isinstance(analysis_result.summary, list):
                                llm_summary = [
                                    msg.model_dump() for msg in analysis_result.summary
                                ]
                            else:
                                llm_summary = analysis_result.summary
                            llm_intent = analysis_result.intent
                            llm_outcome = analysis_result.outcome
                            llm_quality_score = analysis_result.quality_score
                            print(f"LLM Analysis completed for call {call_id}")
                    except Exception as e:
                        print(f"Failed to analyze conversation with LLM: {e}")

                # Create CallAnalysis record
                analysis = CallAnalysis(
                    call_id=call_id,
                    transcript=transcript_str,
                    summary=llm_summary,
                    intent=llm_intent,
                    outcome=llm_outcome,
                    quality_score=(
                        int(llm_quality_score)
                        if llm_quality_score is not None
                        else None
                    ),
                )

                await analysis.insert()
                print(f"✅ Successfully saved call details for {call_id}")
            else:
                print(f"⚠️ Call record not found for call_id: {call_id}")

    elif event_type == "speech":
        pass

    return {"status": "ok"}


def handle_function_call(message):
    function_call = message.get("functionCall", {})
    function_name = function_call.get("name")

    if function_name == "lookup_order":
        order_data = {
            "orderId": function_call.get("parameters", {}).get("orderId"),
            "status": "shipped",
        }
        return {"result": order_data}

    return JSONResponse(status_code=400, content={"error": "Unknown function"})


@app.on_event("startup")
async def startup():
    await connect_db()
    print("✅ Database connected")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
