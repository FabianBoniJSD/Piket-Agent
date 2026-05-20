from xml.etree import ElementTree as ET
from typing import Optional


class TwilioService:
    def get_client(self, settings_obj):
        if not settings_obj.twilio_account_sid or not settings_obj.twilio_auth_token:
            raise ValueError("Twilio credentials are not configured. Please update settings.")
        from twilio.rest import Client
        return Client(settings_obj.twilio_account_sid, settings_obj.twilio_auth_token)

    def create_call(
        self,
        to_phone: str,
        incident_id: int,
        contact_id: int,
        settings_obj,
        base_url: str,
    ) -> str:
        client = self.get_client(settings_obj)
        if not settings_obj.twilio_phone_number:
            raise ValueError("Twilio phone number is not configured. Please update settings.")

        voice_url = (
            f"{base_url}/twilio/voice"
            f"?incident_id={incident_id}&contact_id={contact_id}"
        )
        status_callback = f"{base_url}/twilio/status"

        call = client.calls.create(
            to=to_phone,
            from_=settings_obj.twilio_phone_number,
            url=voice_url,
            status_callback=status_callback,
            status_callback_method="POST",
        )
        return call.sid

    def generate_twiml(
        self,
        voice_message: str,
        incident_id: int,
        contact_id: int,
        base_url: str,
    ) -> str:
        action_url = (
            f"{base_url}/twilio/response"
            f"?incident_id={incident_id}&contact_id={contact_id}"
        )

        response = ET.Element("Response")
        gather = ET.SubElement(
            response,
            "Gather",
            numDigits="1",
            action=action_url,
            method="POST",
        )

        ET.SubElement(gather, "Say", language="de-DE").text = voice_message
        ET.SubElement(gather, "Say", language="de-DE").text = (
            "Drücken Sie die 1, um den Einsatz zu akzeptieren. "
            "Drücken Sie die 2, um abzulehnen."
        )

        # Fallback if no digit is pressed
        ET.SubElement(response, "Say", language="de-DE").text = (
            "Keine Eingabe erkannt. Der Anruf wird beendet."
        )

        return '<?xml version="1.0" encoding="UTF-8"?>' + ET.tostring(
            response, encoding="unicode"
        )


twilio_service = TwilioService()
