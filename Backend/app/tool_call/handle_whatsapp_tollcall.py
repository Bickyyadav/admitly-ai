async def handle_tool_call(tool_call, call_data):
    function = tool_call.get("function", {})
    function_name = function.get("name")
    
    # Try to parse arguments if they are a string
    arguments = function.get("arguments", {})
    if isinstance(arguments, str):
        try:
            import json
            arguments = json.loads(arguments)
        except:
            arguments = {}

    if function_name == "send_whatsapp_document":
        doc_type = arguments.get("document_type")
        # Get customer number from the call metadata
        customer_number = call_data.get("customer", {}).get("number")
        
        # Clean the customer number for Meta API (international format, no +)
        if customer_number:
            to_phone = customer_number.replace("+", "").strip()
            result = whatsapp_service.send_admission_documents(to_phone, doc_type)
            if result:
                return f"Successfully sent the {doc_type} to your WhatsApp."
            else:
                return "I'm sorry, there was an error sending the WhatsApp message. Please try again later."
        else:
            return "I couldn't find your phone number to send the WhatsApp message."

    return "Unknown function"

