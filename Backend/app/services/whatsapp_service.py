import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.base_url = f"https://graph.facebook.com/v20.0/{self.phone_number_id}/messages"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def send_message(self, to_phone, message_type, media_link=None, filename=None, text_content=None):
        """
        Generic method to send messages via WhatsApp Cloud API.
        to_phone: Recipient phone number (international format without +)
        message_type: 'text', 'image', or 'document'
        """
        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": message_type,
        }

        if message_type == "text":
            payload["text"] = {"body": text_content}
        elif message_type == "image":
            payload["image"] = {"link": media_link}
        elif message_type == "document":
            payload["document"] = {
                "link": media_link,
                "filename": filename or "document.pdf"
            }

        try:
            logger.info(f"Sending {message_type} to {to_phone}")
            response = requests.post(self.base_url, headers=self.headers, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp message sent successfully: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response details: {e.response.text}")
            return None

    def send_admission_documents(self, to_phone, document_type):
        """
        Specific method to send admission related documents.
        document_type: 'fee_structure' or 'hostel_structure'
        """
        # Placeholder URLs - Replace these with actual public URLs
        DOCS = {
            "fee_structure": {
                "link": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", # Replace with actual PDF link
                "filename": "Fee_Structure_2024.pdf"
            },
            "hostel_structure": {
                "link": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", # Replace with actual Image/PDF link
                "filename": "Hostel_And_Campus_Details.pdf"
            }
        }

        doc = DOCS.get(document_type)
        if not doc:
            logger.error(f"Unknown document type: {document_type}")
            return None

        # Determine if it's an image or document based on extension (simple check)
        msg_type = "image" if doc["link"].lower().endswith(('.png', '.jpg', '.jpeg')) else "document"
        
        return self.send_message(
            to_phone=to_phone,
            message_type=msg_type,
            media_link=doc["link"],
            filename=doc["filename"]
        )

# Singleton instance
whatsapp_service = WhatsAppService()
