import paho.mqtt.client as mqtt
from typing import Optional
import json
import logging
import time
import os
import uuid

logger = logging.getLogger(__name__)

class MQTTService:
    def __init__(self):
        # Get configuration from environment variables with defaults
        self.host = os.getenv("MQTT_HOST", "192.168.100.20")
        self.port = int(os.getenv("MQTT_PORT", "1883"))
        self.client = mqtt.Client()
        self._setup_client()
        self.connected = False
        logger.info(f"MQTT Service initialized with host: {self.host}, port: {self.port}")
        
    def _setup_client(self):
        """Setup MQTT client with callbacks"""
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_publish = self._on_publish
        
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            logger.info(f"Connected to MQTT broker at {self.host}:{self.port}")
            self.connected = True
        else:
            logger.error(f"Failed to connect to MQTT broker with code: {rc}")
            self.connected = False
            
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected disconnection from MQTT broker with code: {rc}")
            
    def _on_publish(self, client, userdata, mid):
        """Callback when message is published"""
        logger.debug(f"Message published with ID: {mid}")
        
    def connect(self):
        """Connect to MQTT broker"""
        try:
            if not self.connected:
                logger.info(f"Attempting to connect to MQTT broker at {self.host}:{self.port}")
                self.client.connect(self.host, self.port)
                self.client.loop_start()
                # Wait for connection to be established
                timeout = 5  # seconds
                start_time = time.time()
                while not self.connected and time.time() - start_time < timeout:
                    time.sleep(0.1)
                if not self.connected:
                    raise Exception("Failed to connect to MQTT broker within timeout")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {str(e)}")
            self.connected = False
            raise
            
    def disconnect(self):
        """Disconnect from MQTT broker"""
        try:
            self.client.loop_stop()
            self.client.disconnect()
            self.connected = False
            logger.info("Disconnected from MQTT broker")
        except Exception as e:
            logger.error(f"Error during MQTT disconnect: {str(e)}")
        
    def ensure_connected(self):
        """Ensure MQTT client is connected, reconnect if necessary"""
        if not self.connected:
            logger.info("MQTT client not connected, attempting to reconnect...")
            self.connect()
        
    def send_sms(self, number: str, message: str) -> bool:
        """
        Send SMS via MQTT
        
        Args:
            number: Recipient phone number
            message: SMS content
            
        Returns:
            bool: True if message was published successfully
        """
        try:
            self.ensure_connected()
            
            if not self.connected:
                logger.error("MQTT client is not connected")
                return False
                
            # Generate a unique message ID
            message_id = str(uuid.uuid4())
            
            payload = json.dumps({
                "message_id": message_id,
                "number": number,
                "message": message
            })
            
            logger.info(f"Sending SMS to {number} via MQTT with message_id: {message_id}")
            result = self.client.publish("sms/send", payload)
            result.wait_for_publish()
            success = result.rc == mqtt.MQTT_ERR_SUCCESS
            if success:
                logger.info(f"Successfully sent SMS to {number} with message_id: {message_id}")
            else:
                logger.error(f"Failed to publish SMS to {number} with message_id: {message_id}")
            return success
        except Exception as e:
            logger.error(f"Failed to send SMS via MQTT: {str(e)}")
            return False
            
    def update_config(self, host: str, port: int):
        """Update MQTT broker configuration"""
        logger.info(f"Updating MQTT configuration to {host}:{port}")
        self.disconnect()
        self.host = host
        self.port = port
        self.connect()

    def test_connection(self) -> bool:
        """Test MQTT connection and return True if successful"""
        try:
            self.ensure_connected()
            return self.connected
        except Exception as e:
            logger.error(f"MQTT connection test failed: {str(e)}")
            return False

# Create a singleton instance
mqtt_service = MQTTService() 